'use strict';

module.exports = function(localDb) {

  return (ctx, next) => {
    console.log('\nmiddleware stateControl ------------------------------------:')

    console.log('--- state:')
    console.log(ctx.state)
    console.log('--- session:')
    console.log(ctx.session)
    console.log('=================================')
    console.log('updateType: ' + ctx.updateType)
    console.log('=================================')

    switch(ctx.updateType) {
      case 'message':
        break

      case 'callback_query':
        break

      default:
        console.log(ctx.updateType+' -> !!! NO ACTIONS in role middleware !!!')
        break
    }

    ctx.state.role = localDb[ctx.from.id] ? localDb[ctx.from.id] : false

    console.log('--- state new:')
    console.log(ctx.state)
    console.log('--- session new:')
    console.log(ctx.session)

    return next(ctx)
  }

}