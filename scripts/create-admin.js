#!/usr/bin/env node
/**
 * Crear / actualizar un administrador con la contraseña ya hasheada.
 *
 * La columna `admins.password` guarda un hash bcrypt, NO la contraseña real.
 * Si insertas un admin desde pgAdmin con texto plano, el login falla
 * ("Credenciales inválidas"). Este script hace el hash por ti.
 *
 * Uso:
 *   npm run create-admin                            (pregunta email y contraseña)
 *   npm run create-admin -- --email a@b.com --password 123456
 *   npm run create-admin -- --email a@b.com --password 123456 --update
 *   npm run create-admin -- --list                  (ver admins existentes)
 *
 * Opciones:
 *   --email <correo>      Correo del admin
 *   --password <texto>    Contraseña en claro (se hashea antes de guardar)
 *   --update              Si el email ya existe, actualiza su contraseña
 *   --list                Lista los admins y sale
 *   --help                Muestra esta ayuda
 */

const path = require('path')
const readline = require('readline')
const bcrypt = require('bcrypt')
const { Client } = require('pg')

// Carga restaurant-backend/.env sin importar desde qué carpeta se ejecute.
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true })

const BCRYPT_ROUNDS = 10

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'ortuzar',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
}

// ─── Argumentos ──────────────────────────────────────────────

const parseArgs = (argv) => {
  const args = { email: '', password: '', update: false, list: false, help: false }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--email' || arg === '-e') args.email = argv[++i] ?? ''
    else if (arg === '--password' || arg === '-p') args.password = argv[++i] ?? ''
    else if (arg === '--update' || arg === '-u') args.update = true
    else if (arg === '--list' || arg === '-l') args.list = true
    else if (arg === '--help' || arg === '-h') args.help = true
    else {
      console.error(`Opción desconocida: ${arg}`)
      args.help = true
    }
  }

  return args
}

const printHelp = () => {
  console.log(`
Crear / actualizar un administrador (contraseña hasheada con bcrypt)

  npm run create-admin
  npm run create-admin -- --email admin@restaurante.com --password MiClave123
  npm run create-admin -- --email admin@restaurante.com --password MiClave123 --update
  npm run create-admin -- --list

Opciones:
  -e, --email <correo>     Correo del admin
  -p, --password <texto>   Contraseña en claro (se hashea antes de guardar)
  -u, --update             Si el email ya existe, actualiza la contraseña
  -l, --list               Lista los admins existentes
  -h, --help               Muestra esta ayuda
`)
}

// ─── Entrada interactiva ─────────────────────────────────────

/** Pregunta normal (el texto se ve). */
const ask = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })

/** Pregunta ocultando lo que se escribe (muestra asteriscos). */
const askHidden = (question) =>
  new Promise((resolve) => {
    // Si no hay terminal (por ejemplo, entrada por tubería), no se puede ocultar.
    if (!process.stdin.isTTY) {
      ask(question).then(resolve)
      return
    }

    process.stdout.write(question)
    process.stdin.resume()
    process.stdin.setRawMode(true)
    process.stdin.setEncoding('utf8')

    let value = ''
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      process.stdin.setRawMode(false)
      process.stdin.pause()
      process.stdin.removeListener('data', onData)
      process.stdout.write('\n')
      resolve(value)
    }

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n' || char === '\u0004') {
          finish()
          return
        }
        if (char === '\u0003') {
          // Ctrl+C
          process.stdin.setRawMode(false)
          process.stdout.write('\n')
          process.exit(130)
        }
        if (char === '\u007f' || char === '\b') {
          if (value.length > 0) {
            value = value.slice(0, -1)
            process.stdout.write('\b \b')
          }
          continue
        }
        if (char >= ' ') {
          value += char
          process.stdout.write('*')
        }
      }
    }

    process.stdin.on('data', onData)
  })

// ─── Base de datos ───────────────────────────────────────────

const connect = async () => {
  const client = new Client(dbConfig)
  await client.connect()
  return client
}

const listAdmins = async (client) => {
  const { rows } = await client.query(
    'SELECT id, email, left(password, 7) AS prefix, length(password) AS len, created_at FROM admins ORDER BY id'
  )

  if (rows.length === 0) {
    console.log('No hay admins todavía.')
    return
  }

  console.log('\nAdmins registrados:\n')
  console.table(
    rows.map((r) => ({
      id: r.id,
      email: r.email,
      hash: `${r.prefix}… (${r.len} caracteres)`,
      creado: r.created_at,
    }))
  )

  const plain = rows.filter((r) => r.len !== 60)
  if (plain.length > 0) {
    console.log(
      `⚠️  ${plain.length} admin(s) NO tienen un hash bcrypt (password en texto plano):\n` +
        plain.map((r) => `   - ${r.email}`).join('\n') +
        '\n   Corrígelos con: npm run create-admin -- --email <correo> --password <suClave> --update\n'
    )
  }
}

// Validaciones

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateEmail = (email) => EMAIL_REGEX.test(email)

const validatePassword = (password) => {
  if (password.length === 0) return 'La contraseña no puede estar vacía'
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
  return null
}

// ─── Principal ───────────────────────────────────────────────

const main = async () => {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printHelp()
    return
  }

  let client
  try {
    client = await connect()
  } catch (error) {
    console.error(
      '\n❌ No se pudo conectar a PostgreSQL.\n' +
        '   Revisa que el servicio esté encendido y los datos DB_* de restaurant-backend/.env\n' +
        `   Detalle: ${error.message}\n`
    )
    process.exitCode = 1
    return
  }

  try {
    if (args.list) {
      await listAdmins(client)
      return
    }

    // 1) Email
    let email = args.email.trim().toLowerCase()

    while (!email) {
      email = (await ask('Email del admin: ')).trim().toLowerCase()
    }

    if (!validateEmail(email)) {
      console.error(`\n❌ "${email}" no parece un correo válido.`)
      process.exitCode = 1
      return
    }

    // 2) ¿Ya existe?
    const existing = await client.query('SELECT id FROM admins WHERE lower(email) = $1', [email])

    if (existing.rows.length > 0 && !args.update) {
      console.error(
        `\n⚠️  Ya existe un admin con el email ${email} (id ${existing.rows[0].id}).\n` +
          '   Si quieres cambiarle la contraseña, añade --update:\n' +
          `   npm run create-admin -- --email ${email} --password <nueva> --update\n`
      )
      process.exitCode = 1
      return
    }

    // 3) Contraseña (no se muestra en pantalla)
    let password = args.password

    while (!password) {
      password = await askHidden('Contraseña (no se muestra): ')
      const problem = validatePassword(password)
      if (problem) {
        console.log(`   ${problem}. Inténtalo de nuevo.`)
        password = ''
      }
    }

    const problem = validatePassword(password)
    if (problem) {
      console.error(`\n❌ ${problem}.`)
      process.exitCode = 1
      return
    }

    if (password.length < 8) {
      console.log('ℹ️  Consejo: usa al menos 8 caracteres para un admin.')
    }

    // 4) Hash + guardar
    console.log('\nGenerando hash bcrypt...')
    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    let result
    if (existing.rows.length > 0) {
      result = await client.query(
        'UPDATE admins SET password = $1 WHERE lower(email) = $2 RETURNING id, email',
        [hash, email]
      )
      console.log(`\n✅ Contraseña actualizada para ${result.rows[0].email} (id ${result.rows[0].id}).`)
    } else {
      result = await client.query(
        'INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING id, email',
        [email, hash]
      )
      console.log(`\n✅ Admin creado: ${result.rows[0].email} (id ${result.rows[0].id}).`)
    }

    // 5) Comprobación final: el hash guardado valida la contraseña escrita.
    const check = await client.query('SELECT password FROM admins WHERE id = $1', [
      result.rows[0].id,
    ])
    const ok = await bcrypt.compare(password, check.rows[0].password)

    if (ok) {
      console.log('🔐 Verificado: el hash guardado coincide con la contraseña.')
    } else {
      console.error('❌ Algo falló: el hash guardado NO valida la contraseña.')
      process.exitCode = 1
    }

    console.log('\nYa puedes iniciar sesión en el panel con ese email y contraseña.\n')
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
