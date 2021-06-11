const fs = require('fs')
const { formatWithOptions } = require('util')
const { load } = require('@alex.garcia/observable-prerender')

async function run () {
  let jsonFilename
  const notebook = await load(
    '@jimpick/lotus-js-client-space-race-miner-power-scanner',
    ['minerPower', 'selectedDate']
    // { headless: false }
  )
  const selectedEpoch = await notebook.value('selectedEpoch')
  const selectedDate = await notebook.value('selectedDate')
  console.log('Date:', selectedDate)
  const tipSet = await notebook.value('tipSet')
  let count = 0
  while (true) {
    const minerPower = await notebook.value('minerPower')
    if (count++ % 100 === 0) {
      console.log(
        'State: ',
        minerPower.state,
        ' Elapsed: ',
        minerPower.elapsed,
        ' Records: ',
        minerPower.records && minerPower.records.length
      )
    }
    if (minerPower.state === 'done') {
      jsonFilename = `power-${selectedEpoch}.json`
      const jsonFile = fs.createWriteStream(`tmp/${jsonFilename}`)
      for (const record of minerPower.records) {
        const { height, ...rest } = record
        await jsonFile.write(
          JSON.stringify({
            timestamp: selectedDate,
            epoch: selectedEpoch,
            tipSet,
            ...rest
          }) + '\n'
        )
      }
      jsonFile.on('finish', () => {
        fs.rename(`tmp/${jsonFilename}`, `input/miner-power/${jsonFilename}`, err => {
          if (err) {
            console.error('Error', err)
            process.exit(1)
          }
        })
      })
      jsonFile.end()
      break
    }
  }
  console.log('Filename:', jsonFilename)
  console.log('Epoch:', selectedEpoch)
  console.log('Date:', selectedDate)
  console.log('TipSet:', tipSet)
  await notebook.browser.close()
}
run()