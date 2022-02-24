
export default function(doc: any): string {
  switch (doc.type) {
  case 'definition': return `/#def-${doc.id}`
  case 'fallacy': return `/#${doc.uid}`
  default: return '/'
  }
}
