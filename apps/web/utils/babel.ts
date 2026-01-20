const TEMPLATE_TOKENS = {
  st: '{{#',
  ed: '#}}',
  stChar: '{',
}
/**
 * 将带有 {{##}}模版的json转换为普通json
 * 转换规则：
 * 针对在字符串内本身的模版 "foo {{#foo.bar#}} bar" 转换为 “foo {{#str/foo.bar#}} bar”
 * 针对在字符串外的模版 foo: {{#foo.bar#}} 或  {{#foo.bar#}}:bar 转换为 "{{#raw/foo.bar#}}":bar 之类的
 * */
export function transTemplatedJson2CommonJson(json: string): string {
  const resultTokens: string[] = []
  // 这个状态机用于处理模板是在字符串里面还是外面
  const state = {
    inString: false,
    escaped: false,
    skip: 0,
  }
  json.split('').forEach((char, index) => {
    // 考虑skip字符 skip的字符不放在token list
    if (state.skip) {
      state.skip--
      return
    }
    // 当匹配到字符串的转义字符时 下一个字符直接放在token list
    if (state.escaped) {
      resultTokens.push(char)
      state.escaped = false
      return
    }
    // 只有字符串里面才有转义字符
    if (state.inString && char === '\\') {
      resultTokens.push(char)
      state.escaped = true
      return
    }
    // 字符串边界
    if (char === '"') {
      resultTokens.push(char)
      state.inString = !state.inString
      return
    }
    // 这里可以保证模版不会出现 syntax error
    // 检查是否开始模板
    if (
      char === TEMPLATE_TOKENS.stChar
      && json.slice(index, index + TEMPLATE_TOKENS.st.length)
        === TEMPLATE_TOKENS.st
    ) {
      // 找到模板结束位置 }}#
      const endIndex = json.indexOf(TEMPLATE_TOKENS.ed, index)
      if (endIndex !== -1) {
        const templateContent = json.slice(
          index + TEMPLATE_TOKENS.st.length,
          endIndex,
        )
        if (state.inString) {
          resultTokens.push(
            `${TEMPLATE_TOKENS.st}str/${templateContent}${TEMPLATE_TOKENS.ed}`,
          )
        } // 在string里面的占位符不需要引号包裹
        else {
          resultTokens.push(
            `"${TEMPLATE_TOKENS.st}raw/${templateContent}${TEMPLATE_TOKENS.ed}"`,
          )
        } // string外的占位符包裹为string方便格式化

        state.skip = endIndex - index + TEMPLATE_TOKENS.ed.length - 1 // 跳过 #}}
        // 计算方法  {{#foo.bar#}}
        //          ^index   ^endIndex len({{#foo.bar)=endIndex-index + len(ed)
        return
      }
    }
    resultTokens.push(char)
  })
  return resultTokens.join('')
}
/**
 * 将带有 {{##}}模版的转换后的json转换为模版json
 * 转换规则："{{#raw/foo.bar#}}" -> {{#foo.bar#}}
 *  {{#str/foo.bar#}} -> -> {{#foo.bar#}}
 * */
export function transCommonJson2TemplatedJson(json: string): string {
  // 处理带引号的 raw 模板："{{#raw/foo.bar#}}" -> {{#foo.bar#}}
  const rawPattern = /"\{\{#raw\/([^#]+)#}}"/g
  json = json.replace(rawPattern, '{{#$1#}}')

  // 处理不带引号的 str 模板：{{#str/foo.bar#}} -> {{#foo.bar#}}
  const strPattern = /\{\{#str\/([^#]+)#}}/g
  json = json.replace(strPattern, '{{#$1#}}')

  return json
}

export function hasTemplate(s: string): boolean {
  return /\{\{#.*?#}}/.test(s)
}
export function delTemplate(s: string): string {
  return s.replaceAll(/\{\{#.*?#}}/g, '')
}
