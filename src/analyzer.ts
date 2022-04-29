import cheerio from 'cheerio'
import fs from 'fs'
import { AnalyzerType } from './crowller'
interface CourseInfor {
  title: string
  count: number
}
interface CourseResult {
  time: number
  data: CourseInfor[]
}
interface Content {
  [propName: number]: CourseInfor[]
}
export class Analyzer implements AnalyzerType {
  getJsonInfo(html: string) {
    const $ = cheerio.load(html)
    const courseItems = $('.course-item')
    const courseInfo: CourseInfor[] = []
    courseItems.map((i, e) => {
      const descs = $(e).find('.course-desc')
      const title = descs.eq(0).text()
      const count = Number(
        descs
          .eq(1)
          .text()
          .split('：')[1]
      )
      courseInfo.push({
        title,
        count
      })
    })
    //要获取当前时间的时间戳
    return {
      time: new Date().getTime(),
      data: courseInfo
    }
  }

  generateJsonContent(courseResuilt: CourseResult, filePath: string) {
    let fileContent: Content = {} //因为是个对象，所以对字符串要做处理，用JSON.parse转换成obj
    if (fs.existsSync(filePath)) {
      fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
    fileContent[courseResuilt.time] = courseResuilt.data
    return fileContent
  }

  public analyzer(html: string, filePath: string) {
    const courseResuilt = this.getJsonInfo(html)
    const fileContent = this.generateJsonContent(courseResuilt, filePath)
    return JSON.stringify(fileContent)
  }
}
