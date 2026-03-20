export function useDurationEstimate(contentType: string, content: unknown): number {
  if (!content) return 0;

  switch (contentType) {
    case 'text': {
      if (typeof content !== 'string') return 0;
      // Strip HTML tags and count words
      const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = text ? text.split(' ').length : 0;
      return Math.ceil(words / 200);
    }
    case 'quiz': {
      if (Array.isArray(content)) {
        return Math.ceil(content.length * 1.5);
      }
      return 0;
    }
    case 'code':
      return 4;
    case 'video':
      return 0; // unknown until uploaded
    default:
      return 0;
  }
}
