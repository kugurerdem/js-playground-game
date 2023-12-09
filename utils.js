let DEBUG_MODE = window.location.hash === '#debug'
const utils = (() => {
    const {assign} = Object

    const EventEmitter = class {
        constructor () {
            this.listeners = {}
        }

        on (event, listener) {
            if (!this.listeners[event]) this.listeners[event] = []
            this.listeners[event].push(listener)
        }

        off (event, listener) {
            if (!this.listeners[event]) return
            this.listeners[event] = this.listeners[event].filter(
                l => l !== listener
            )
        }

        once (event, listener) {
            const onceListener = (...args) => {
                listener(...args)
                this.off(event, onceListener)
            }
            this.on(event, onceListener)
        }

        emit (event, ...args) {
            if (!this.listeners[event]) return
            this.listeners[event].forEach(listener => listener(...args))
        }
    }

    const SpriteImage = class {
        constructor({image, x, y, w, h, scale, flip, flop}) {
            this.image = image
            this.x = x
            this.y = y

            this.imageWidth = w
            this.imageHeight = h

            this.scale = scale || 1

            this.width = w * this.scale
            this.height = h * this.scale

            this.flip = flip || false
            this.flop = flop || false
        }

        draw (ctx, x, y, _scale = 1) {
            const
                scale = this.scale * _scale,

                scaledX = x / scale,
                scaledY = y / scale
            // NOTE: Since we scale the coordinate system, we need to downscale
            // X and Y coordinates to match the scaled image.

            ctx.save()

            // NOTE: we could have also used the setTransform method, however
            // this is a bit more explicit way of achieving to scale the
            // coordinate system. For reference:
            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform
            ctx.scale(
                this.flip ? -scale : scale,
                this.flop ? -scale : scale,
            )

            ctx.drawImage(
                this.image,
                // Source coordinates
                this.x, this.y, this.imageWidth, this.imageHeight,
                // Destination coordinates
                this.flip ? -scaledX -this.imageWidth: scaledX,
                this.flop ? -scaledY -this.imageHeight: scaledY,
                this.imageWidth, this.imageHeight,
            )


            ctx.restore()
        }
    }

    const Animation = class extends EventEmitter {
        constructor({frames, frameRate, name}) {
            super()
            this.name = name
            this.frames = frames
            this.frameRate = frameRate
            this.accumulatedTime = 0
            this.active = false
        }

        update (deltaTime) {
            if (!this.active) return
            this.accumulatedTime += deltaTime
            if (this.accumulatedTime > this.frames.length / this.frameRate) {
                this.emit('complete')
            }
        }

        getCurrentFrame () {
            const
                frameIndex = Math.floor(this.accumulatedTime * this.frameRate)

            return this.frames[frameIndex % this.frames.length]
        }

        start () {
            assign(this, {active: true, accumulatedTime: 0})
        }

        stop () {
            assign(this, {active: false, accumulatedTime: 0})
        }
    }

    const SpriteSheet = class {
        constructor({image, frames, animations, scale}) {
            this.image = image

            this.frames = _.mapValues(
                frames,
                frameData => new SpriteImage({image, ...frameData, scale}),
            )

            this.animations = animations // { [name]: { frames, frameRate } }
        }

        getAnimation (name) {
            const
                animation = this.animations[name],
                frames =
                    animation.frames.map(frameName => this.frames[frameName]),
                frameRate = animation.frameRate

            return new Animation({
                name, frames, frameRate,
            })

        }
    }

    const loadImage = src => new Promise((resolve, reject) => {
        const image = new Image()
        image.src = src
        image.onload = () => resolve(image)
        image.onerror = reject
    })

    const collides = (box1, box2) => !(
        box1.x + box1.width < box2.x
        || box1.x > box2.x + box2.width
        || box1.y + box1.height < box2.y
        || box1.y > box2.y + box2.height
    )

    const debug = (callbackFn) => DEBUG_MODE && callbackFn()

    return {
        EventEmitter,

        SpriteImage,
        Animation,
        SpriteSheet,
        loadImage,

        collides,
        debug,
    }
})()
