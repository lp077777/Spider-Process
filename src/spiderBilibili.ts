//ts直接引用js库会报错 用  .d.ts翻译文件作为中间件使用
import superagent from 'superagent'
import fs from 'fs'
import path from 'path'
import { bilibiliCookie } from './bilibiliCookie'
import cheerio from 'cheerio'
//注释掉的代码用于爬取b站当前排行榜数据

interface BilibliInfor {
  title: string
  upName: string
  playVol: string
  barrage: string
}
interface BilibliResult {
  time: number
  data: BilibliInfor[]
}
interface BilibiliContent {
  [propName: number]: BilibliInfor[]
}
class SpiderBilibili {
  private url = `https://www.bilibili.com/v/popular/rank/all`
  private filePath = path.resolve(__dirname, '../data/bilibili.json')
  getJsonInfo(html: string) {
    const $ = cheerio.load(html)
    const bilibiliItems = $('.info')

    const bilibliInfo: BilibliInfor[] = []
    bilibiliItems.map((i, e) => {
      const descs = $(e).find('.title')
      const title = descs.eq(0).text()
      const detail = $(e).find('.data-box')
      const upName = detail
        .eq(0)
        .text()
        .trim()
      const playVol = detail
        .eq(1)
        .text()
        .trim()
      const barrage = detail
        .eq(2)
        .text()
        .trim()
      bilibliInfo.push({
        title,
        upName,
        playVol,
        barrage
      })
    })

    //要获取当前时间的时间戳
    return {
      time: new Date().getTime(),
      data: bilibliInfo
    }
  }
  async getRawHtml() {
    const result = await superagent.get(this.url).set('cookie', bilibiliCookie)
    return result.text
  }
  //为了保证各个function不耦合，新写一个 initSpiderProcess 作为接口供外部调用，其余function中不再调用别的function
  //import fs path,用于将获取到的数据保存为json格式存到本地
  //思維：每個function的功能职责尽量明确，不要同一个function执行多功能，造成耦合
  generateJsonContent(bilibliResuilt: BilibliResult) {
    //储存json数据
    let fileContent: BilibiliContent = {} //因为是个对象，所以对字符串要做处理，用JSON.parse转换成obj
    if (fs.existsSync(this.filePath)) {
      fileContent = JSON.parse(fs.readFileSync(this.filePath, 'utf-8'))
    }
    fileContent[bilibliResuilt.time] = bilibliResuilt.data
    return fileContent
  }
  async initSpiderProcess() {
    const html = await this.getRawHtml()
    const courseResuilt = this.getJsonInfo(html)
    const fileContent = this.generateJsonContent(courseResuilt)
    fs.writeFileSync(this.filePath, JSON.stringify(fileContent))
  }

  constructor() {
    this.initSpiderProcess()
  }
}

const spiderBilibili = new SpiderBilibili()
