const expect = require('expect.js')


describe('/app', function () {
  describe('/connect.js', function () {
    describe('Connect.prototype', function () {
      before(() => {

        this.connect = new (require('../app/connect').Connect)({
          host: '192.168.99.100',
          port: '6379'
        })

      })


      it('#connection', () => {
        const connect = this.connect

        expect(connect.connection).not.to.be(undefined)
      })

      it('#keys', async () => {
        const connect = this.connect

        const keys = await connect.keys()

        expect(keys).to.be.a('array')
      })

      it('#set', async () => {
        const connect = this.connect

        const keynametoset = 'testerval'
        const valuetoset = 'mytesterval'

        const added = await connect.set(keynametoset, valuetoset)

        expect(added).to.be.ok()
        expect(await connect.keys()).to.contain(keynametoset)
      })

      it('#get', async () => {
        const connect = this.connect

        const keynametosettoget = 'testsettoget'
        const valuetosettoget = 'mycutomvalue'

        expect(await connect.set(keynametosettoget, valuetosettoget)).to.be.ok()
        expect(await connect.get(keynametosettoget)).to.be(valuetosettoget)
      })

      it('#forEach', async () => {
        const connect = this.connect

        const keys = await connect.keys()

        let n = 0
        await connect.forEach((e) => {
          n+=1
        })

        expect(n).to.be(keys.length)
      })

      it('#has', async () => {
        const connect = this.connect

        const keynametosettoget = 'testsettoget'
        const keynametonotexists = 't.h.i.s.v.a.l.u.e.n.o.n.o.t.e.x.i.s.t'
        const valuetosettoget = 'mycutomvalue'

        expect(await connect.set(keynametosettoget, valuetosettoget)).to.be.ok()
        expect(await connect.has(keynametosettoget)).to.be.ok()
        expect(await connect.has(keynametonotexists)).not.to.be.ok()
      })

    })

  })

})

