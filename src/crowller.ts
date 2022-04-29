//ts直接引用js库会报错 用  .d.ts翻译文件作为中间件使用
import superagent from 'superagent'
import fs from 'fs'
import path from 'path'
import { bilibiliCookie } from './bilibiliCookie'
import { Analyzer } from './analyzer'
//注释掉的代码用于爬取b站当前排行榜数据

export interface AnalyzerType {
  analyzer: (html: string, filePath: string) => string
}

class Crowller {
  private filePath = path.resolve(__dirname, '../data/course.json')

  async getRawHtml(cookie?: string) {
    const result = cookie
      ? await superagent.get(this.url).set('cookie', cookie)
      : await superagent.get(this.url)
    return result.text
  }
  //为了保证各个function不耦合，新写一个 initSpiderProcess 作为接口供外部调用，其余function中不再调用别的function
  //import fs path,用于将获取到的数据保存为json格式存到本地
  //思維：每個function的功能职责尽量明确，不要同一个function执行多功能，造成耦合

  writeFile(content: string) {
    fs.writeFileSync(this.filePath, content)
  }
  async initSpiderProcess(cookie?: string) {
    const html = cookie
      ? await this.getRawHtml(cookie)
      : await this.getRawHtml()
    const fileContent = this.analyzer.analyzer(html, this.filePath)
    this.writeFile(fileContent)
  }

  constructor(
    private url: string,
    private analyzer: AnalyzerType,
    private cookie?: string
  ) {
    cookie ? this.initSpiderProcess(cookie) : this.initSpiderProcess()
  }
}

const secret = 'x3b174jsx'
const url_1 = `http://www.dell-lee.com/typescript/demo.html?secret=${secret}`

const analyzer = new Analyzer()
new Crowller(url_1, analyzer)
