import moment from 'moment'

export interface NoteType {
  id: number
  title: string
  content: string
  date: string
  isFavorite: boolean
  tags: string[]
  cid: string;
}

export const formatDate = (dateString: string): string => {
  const date = moment(dateString, 'YYYYMMDDHHmmss')

  if (moment().isSame(date, 'day')) {
    return moment.duration(date.diff(moment(), 'milliseconds')).humanize(true)
  } else {
    return date.format('YYYY/MM/DD')
  }
}
