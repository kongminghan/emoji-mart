import React from 'react'
import data from '../../data'

const SHEET_SIZE = 2624
const EMOJI_SIZE = 64
const SKINS = [
  '1F3FA', '1F3FB', '1F3FC',
  '1F3FD', '1F3FE', '1F3FF',
]

export default class Emoji extends React.Component {
  constructor(props) {
    super(props)

    var emojiData = this.getEmojiData()
    this.hasSkinVariations = !!emojiData.skin_variations
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.hasSkinVariations && nextProps.skin != this.props.skin ||
      nextProps.size != this.props.size ||
      nextProps.sheetURL != this.props.sheetURL
    )
  }

  getEmojiData() {
    var { emoji, skin, sheetURL } = this.props,
        emojiData = emoji

    if (typeof emoji == 'string') {
      emojiData = data.emojis[emoji]
    }

    if (this.hasSkinVariations && skin > 1) {
      emojiData = JSON.parse(JSON.stringify(data.emojis[emoji]))

      var skinKey = SKINS[skin - 1],
          variationKey = `${emojiData.unified}-${skinKey}`,
          variationData = emojiData.skin_variations[variationKey],
          kitMatches = sheetURL.match(/(apple|google|twitter|emojione)/),
          kit = kitMatches[0]

      if (variationData[`has_img_${kit}`]) {
        emojiData.skin_tone = skin

        for (let k in variationData) {
          let v = variationData[k]
          emojiData[k] = v
        }
      }
    }

    return emojiData
  }

  getSheetSize() {
    var { size } = this.props,
        sheetSize = SHEET_SIZE * size / EMOJI_SIZE

    return `${sheetSize}px ${sheetSize}px`
  }

  getPosition(emojiData) {
    var { size } = this.props,
        { sheet_x, sheet_y } = emojiData,
        x = sheet_x * size,
        y = sheet_y * size

    return `-${x}px -${y}px`
  }

  getNative(emojiData) {
    var { unified } = emojiData,
        unicodes = unified.split('-'),
        codePoints = unicodes.map((u) => `0x${u}`)

    return String.fromCodePoint(...codePoints)
  }

  handleClick(emojiData) {
    var { onClick } = this.props,
        { name, short_names, skin_tone, text, texts, unified } = emojiData,
        id = short_names[0],
        colons = `:${id}:`

    texts || (texts = [])
    if (text && !texts.length) {
      texts = [text]
    }

    if (skin_tone) {
      colons += `:skin-tone-${skin_tone}:`
    }

    onClick({
      id,
      name,
      colons,
      skin: skin_tone || 1,
      emoticons: texts,
      native: this.getNative(emojiData),
    })
  }

  render() {
    var { sheetURL, size, onOver, onLeave } = this.props,
        emojiData = this.getEmojiData()

    return <span
      onClick={() => this.handleClick(emojiData)}
      onMouseEnter={() => onOver(emojiData)}
      onMouseLeave={() => onLeave(emojiData)}
      className='emoji-picker-emoji'>
      <span style={{
        width: size,
        height: size,
        display: 'inline-block',
        backgroundImage: `url(${sheetURL})`,
        backgroundSize: this.getSheetSize(),
        backgroundPosition: this.getPosition(emojiData),
      }}>
      </span>
    </span>
  }
}

Emoji.propTypes = {
  skin: React.PropTypes.number,
  onOver: React.PropTypes.func,
  onLeave: React.PropTypes.func,
  onClick: React.PropTypes.func,
  size: React.PropTypes.number.isRequired,
  sheetURL: React.PropTypes.string.isRequired,
  emoji: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.object,
  ]).isRequired,
}

Emoji.defaultProps = {
  skin: 1,
  onOver: (() => {}),
  onLeave: (() => {}),
  onClick: (() => {}),
}
