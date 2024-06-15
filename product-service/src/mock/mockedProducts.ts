import { ProductItem } from '../types'

const mockedProducts: ProductItem[] = [
  {
    id: 1,
    title: 'The Bird',
    description: 'Beautiful brown bird',
    price: 50,
    count: 3,
    image: 'https://grandgames.net/pics/puzzle/krasnie_yagodi_.jpg',
  },
  {
    id: 2,
    title: 'AI Manul',
    description: 'Bad quality manul with artefacts',
    price: 20,
    count: 5,
    image: 'https://grandgames.net/pics/puzzle/manul_3.jpg',
  },
  {
    id: 3,
    title: 'Beautiful Girl',
    description: 'AI generated very beautiful woman with yellow flowers',
    price: 150,
    count: 1,
    image: 'https://grandgames.net/pics/puzzle/tsvetok_v_volosah_.jpg',
  },
]

export default mockedProducts
