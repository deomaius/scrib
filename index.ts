import protobuf from 'protobufjs'
import { struct as serializer } from 'pb-util'

const { Type, Field, Root } = protobuf

const defaultConversion = {
  enums: String,
  longs: String,  
  bytes: String, 
  defaults: true, 
  arrays: true,  
  objects: true,  
}

export default class Scrib {
  #cacheBuffers: Buffer[]
  #cacheSelectors: Root[]
  #cacheDescriptors: string[]
  #fieldDescriptors: string[]

  constructor(
    cacheLabel: string,
    fieldLabel: string,
    fieldType: number
  ) {
    const field = new Field(fieldLabel, 1, fieldType)
    const message = new Type("data").add(field)
    const root = new Root().define(cacheLabel).add(message)
 
    this.#cacheBuffers = []
    this.#cacheSelectors = [ root ]
    this.#cacheDescriptors = [ cacheLabel ]
    this.#fieldDescriptors = [ fieldLabel ]
  }

  encode(payload: Object) {
    const descriptor = serializer.encode(payload)

    const key = Object.keys(payload)[0]
    const root = Root.fromJSON(payload)
 
    const isStoredSelector = this.#cacheSelectors.find((e) => e.name === key)
    const storedSelectorIndex = this.#cacheSelectors.indexOf(isStoredSelector)

    if (!isStoredSelector) throw new Error('No selector found')
    
    const cache = this.#cacheSelectors[storedSelectorIndex]

    // console.log(cache.nested.data.fields)

    const messageType = cache.lookupType(`${key}.data`)
    const message = messageType.create(payload)

    const isNotValidMessage = messageType.verify(message)

    if (isNotValidMessage) throw Error(isNotValidMessage)

    const buffer = messageType.encode(message).finish()

    this.#cacheBuffers.push(buffer)

    return buffer
  }

  decode(index: number) {
    const selectedCache = this.#cacheSelectors[index]

    if (!selectedCache) throw new Error('No cache found')

    const stores = this.#cacheBuffers.length
    const key = this.#cacheDescriptors[stores - 1]
    const latestBuffer = this.#cacheBuffers[stores - 1]

    const messageType = selectedCache.lookupType(`${key}.data`)
    const message = messageType.decode(latestBuffer)

    return messageType.toObject(message, defaultConversion)
  }

  write(index: number) {
    const selectedCache = this.#cacheSelectors[index]

    if (!selectedCache) throw new Error('No cache found')
  
    const stores = this.#cacheBuffers.length
    const latestBuffer = this.#cacheBuffers[stores - 1]

    try {
      fs.writeFile(`${index}.txt`, latestBuffer, err => {
        if (err) {
          throw Error(err)
        } else {
          console.log('Successfully written store')
        }
      })
    } catch (e) { 
      throw Error(e)
    }
  }
  
}

 

