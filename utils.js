const utils = (() => {
    const {assign} = Object

    const SpriteImage = class {
        constructor({image, x, y, w, h, scale, flip, flop}) {
            this.image = image
            this.x = x
            this.y = y
            this.w = w
            this.h = h

            this.scale = scale || 1
            this.flip = flip || false
            this.flop = flop || false
        }

        draw (ctx, x, y, _scale = 1) {
            const scale = this.scale * _scale

            ctx.save()

            // Note, we could have also used the setTransform method, however
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
                this.x, this.y, this.w, this.h,
                // Destination coordinates
                this.flip ? -x -this.w: x,
                this.flop ? -y -this.h: y,
                this.w, this.h,
            )

            ctx.restore()
        }
    }

    const Animation = class {
        constructor({frames, frameRate}) {
            this.frames = frames
            this.frameRate = frameRate
            this.accumulatedTime = 0
            this.active = false
        }

        update (deltaTime) {
            if (!this.active) return
            this.accumulatedTime += deltaTime
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

            this.animations = _.mapValues(
                animations,
                animationData => new Animation({
                    frames:
                        animationData.map(frameName => this.frames[frameName]),
                    frameRate: 6,
                }),
            )
        }
    }

    const loadImage = src => new Promise((resolve, reject) => {
        const image = new Image()
        image.src = src
        image.onload = () => resolve(image)
        image.onerror = reject
    })


    return {
        SpriteImage,
        Animation,
        SpriteSheet,
        loadImage,
    }
})()
