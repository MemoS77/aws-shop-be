import { fillDB } from './db/fill'

async function init() {
  await fillDB()
  console.log('DB filled!')
  // TODO: other ops
}

init().then(() => console.log('App initialized!'))
