import type { Receive } from '@rdjksp/node-napcat-ts'
import { NCWebsocket } from '@rdjksp/node-napcat-ts'

export class NapcatWsSdk extends NCWebsocket {
  /* ======================
   * 消息链
   * ====================== */
  async parseChain(
    chain: Receive[keyof Receive][],
    { deep}: { deep?: boolean } = {},
  ): Promise<string> {
    return (await Promise.all(chain.map(seg => this.parseSegment(seg, { deep })))).join(' ')
  }

  /* ======================
   * 单段分发
   * ====================== */
  async parseSegment(
    msg: Receive[keyof Receive],
    { deep}: { deep?: boolean } = {},
  ): Promise<string> {
    switch (msg.type) {
      case 'text': return this.parseText(msg)
      case 'at': return this.parseAt(msg)
      case 'image': return this.parseImage(msg)
      case 'file': return this.parseFile(msg)
      case 'video': return this.parseVideo(msg)
      case 'record': return this.parseRecord(msg)
      case 'poke': return this.parsePoke(msg)
      case 'dice': return this.parseDice(msg)
      case 'rps': return this.parseRps(msg)
      case 'face': return this.parseFace(msg)
      case 'reply': return this.parseReply(msg, { deep })
      case 'forward': return this.parseForward(msg)
      case 'json': return this.parseJson(msg)
      case 'markdown': return this.parseMarkdown(msg)
      default: return ''
    }
  }

  /* ======================
   * 各类型解析（全部 string）
   * ====================== */

  async parseText(msg: Receive['text']): Promise<string> {
    return msg.data.text
  }

  async parseAt(
    msg: Receive['at'],
  ): Promise<string> {
    if (msg.data.qq === 'all')
      return '@全体成员'

    const info = await this.get_stranger_info({
      user_id: Number(msg.data.qq),
    })

    return `@${info.nickname}`
  }

  async parseImage(_: Receive['image']): Promise<string> {
    return '[图片]'
  }

  async parseFile(msg: Receive['file']): Promise<string> {
    return `[文件 ${msg.data.file} ]`
  }

  async parseVideo(msg: Receive['video']): Promise<string> {
    return `[视频 ${msg.data.file} ]`
  }

  async parseRecord(_: Receive['record']): Promise<string> {
    return '[语音]'
  }

  async parsePoke(_: Receive['poke']): Promise<string> {
    return '[戳一戳]'
  }

  async parseDice(msg: Receive['dice']): Promise<string> {
    return `[骰子:${msg.data.result}]`
  }

  async parseRps(msg: Receive['rps']): Promise<string> {
    return `[猜拳:${msg.data.result}]`
  }

  async parseFace(msg: Receive['face']): Promise<string> {
    return msg.data.raw?.faceText
      ? `[表情:${msg.data.raw.faceText}]`
      : '[表情]'
  }

  async parseReply(
    msg: Receive['reply'],
    options: { deep?: boolean } = {},
  ): Promise<string> {
    const deep = options.deep !== false

    const origin = await this.get_msg({
      message_id: Number(msg.data.id),
    })

    if (!deep)
      return `[回复 @${origin.sender.nickname}]`

    const content = await this.parseChain(origin.message, { deep: false })

    return `回复 @${origin.sender.nickname}：${content}`
  }

  /* ======================
   * forward
   * ====================== */
  async parseForward(
    _: Receive['forward'],
  ): Promise<string> {
    return '[转发消息]'
  }

  async parseJson(_: Receive['json']): Promise<string> {
    return '[JSON消息]'
  }

  async parseMarkdown(_: Receive['markdown']): Promise<string> {
    return '[Markdown消息]'
  }
}
