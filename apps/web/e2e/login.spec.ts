import { testAi as test } from './base/midscene'

test.describe('登录页面', () => {
  test('login 页面正常登录流程', async ({ page, aiInput, aiTap, aiAssert }) => {
    await page.goto('http://localhost/login')
    await aiInput('邮箱地址输入框', 'root@napflow.com')
    await aiInput('密码输入框', 'root')
    await aiTap('登录按钮')
    await aiAssert('页面包含“点击开始配置您的聊天机器人”文案')
    await aiAssert('主内容区域包含“创建新Bot点击开始配置您的聊天机器人”文案')
    await aiAssert('页面标题包含“NapFlow”')
    await aiAssert('导航栏包含“机器人”菜单项')
    await aiAssert('导航栏包含“工作流”菜单项')
    await aiAssert('导航栏包含“健康面板”菜单项')
    await aiAssert('页面显示当前登录用户为 root')
  })

  test('未输入邮箱被拦截', async ({ page, aiTap, aiAssert }) => {
    await page.goto('http://localhost/login')
    await aiTap('登录按钮')
    await aiAssert('页面显示 Validation Error')
    await aiAssert('页面显示错误信息“Invalid email address”')
  })

  test('输入的邮箱不合法', async ({ page, aiInput, aiTap, aiAssert }) => {
    await page.goto('http://localhost/login')
    await aiInput('邮箱地址输入框', 'napflow.com')
    await aiInput('密码输入框', '1334')
    await aiTap('登录按钮')
    await aiAssert('页面显示错误信息“Invalid email address”')
  })

  test('未输入密码被拦截', async ({ page, aiTap, aiAssert }) => {
    await page.goto('http://localhost/login')
    await aiTap('登录按钮')
    await aiAssert('页面显示密码必填错误信息')
  })

  test('前端校验全部通过 但是用户不存在', async ({ page, aiInput, aiTap, aiAssert }) => {
    await page.goto('http://localhost/login')
    await aiInput('邮箱地址输入框', 'riit@napflow.com')
    await aiInput('密码输入框', '134345')
    await aiTap('登录按钮')
    await aiAssert('页面显示“用户不存在或密码错误”')
  })
})
