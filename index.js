const request = require('request')
const _ = require('lodash')
const fs = require('fs')
const output = './emoji_data.json'
if (fs.existsSync(output)) {
  fs.unlinkSync(output)
}

// These are hardcoded into the app as well
const TYPE_PEOPLE = 0
const TYPE_ACTIVITIES = 1
const TYPE_FOOD_AND_DRINKS = 2
const TYPE_ANIMALS_AND_NATURE = 3
const TYPE_TRAVEL_AND_PLACES = 4
const TYPE_OBJECTS = 5
const TYPE_FLAGS = 6
const TYPE_SYMBOLS = 7

// Downloading from iamcal/emoji-data
const sourceUrl = "https://raw.githubusercontent.com/iamcal/emoji-data/master/emoji_pretty.json"
const sourceTypes = {
  "Symbols": TYPE_SYMBOLS,
  "Activities": TYPE_ACTIVITIES,
  "Flags": TYPE_FLAGS,
  "Travel & Places": TYPE_TRAVEL_AND_PLACES,
  "Food & Drink": TYPE_FOOD_AND_DRINKS,
  "Animals & Nature": TYPE_ANIMALS_AND_NATURE,
  "Smileys & People": TYPE_PEOPLE,
  "Objects": TYPE_OBJECTS
}
console.log('Downloading emojis from GitHub.')
request(sourceUrl, (error, response, body) => {
  if (error) {
    console.error(error)
  } else {
    var source = JSON.parse(body)
    console.log('Donwloaded emojis. Count:', source.length)

    // First of all, remove the unknown categories,
    // Or the obsolete emojis.
    source = _.filter(source, (item) => {
      if (_.includes(_.keys(sourceTypes), item.category) && !item.obsoleted_by) {
        return true
      } else {
        console.log('Removing item with category', item.category)
        return false
      }
    })
    console.log('Removed Unknown categories. Count:', source.length)

    // Then sort by our category integer.
    source = _.sortBy(source,
      (item) => sourceTypes[item.category],
      (item) => item.sort_order)

    // Now process each emoji saving only what we really need.
    var lastSkinItemIndex = -1
    const result = _.map(source, (item, index) => {
      console.log('Processing emoji', index, 'with order ', item.sort_order)
      const emoji = {}
      // emoji.name = item.name
      // emoji.short = item.short_name
      emoji.value = item.unified
      emoji.type = sourceTypes[item.category]
      if (item.skin_variations) {
        lastSkinItemIndex = index
        const skins = []
        _.forEach(item.skin_variations, (item) => {
          skins.push(item.unified)
        })
        emoji.skins = skins
      }
      return emoji
    })
    console.log('Done processing. Logging a full item to be sure (item', lastSkinItemIndex, '):')
    console.log('Source item:', source[lastSkinItemIndex])
    console.log('Processed item:', result[lastSkinItemIndex])

    // Write to file.
    // Pretty file: JSON.stringify(data, null, 2)
    const emojiFile = JSON.stringify(result)
    fs.writeFileSync(output, emojiFile)
  }
})
