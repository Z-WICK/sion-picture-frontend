/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace API {
  type PictureVO = { [key: string]: any }
  type SpaceVO = { [key: string]: any }
  type SpaceUserVO = { [key: string]: any }
  type UserVO = { [key: string]: any }
  type LoginUserVO = { [key: string]: any }
  type ImageSearchResult = { [key: string]: any }
  type Picture = { [key: string]: any }
  type Space = { [key: string]: any }
  type SpaceLevel = {
    id?: number
    text?: string
    maxSize?: number
    maxCount?: number
  }

  type SpaceCategoryAnalyzeResponse = Array<{
    category?: string
    count?: number
    totalSize?: number
    tag?: string
    period?: string
  }>

  type SpaceSizeAnalyzeResponse = Array<{
    sizeRange?: string
    count?: number
  }>

  type SpaceUsageAnalyzeResponse = {
    usedSize?: number
    maxSize?: number
    sizeUsageRatio?: number
    usedCount?: number
    maxCount?: number
    countUsageRatio?: number
  }
}
