export type CalculatorDescriptor = {
  title: string
  path: string
  description: string
  image: {
    small: string
    large: string
    author: {
      handle: string
      name: string
    }
  },
  dir: string
}
