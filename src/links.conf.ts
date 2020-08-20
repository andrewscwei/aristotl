import { Document } from 'prismic-javascript/types/documents';

export default function(doc: Document) {
  switch (doc.type) {
  case 'definition': return `/#def-${doc.id}`;
  case 'fallacy': return `/#${doc.uid}`;
  default: return '/';
  }
}
