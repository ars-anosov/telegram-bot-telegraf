'use strict';



module.exports = function(ctx, markup) {
  console.log('controller pay_methods -----------------------------------------:')

  ctx.session.value = 'Способы оплаты (в разработке)'
//'            <a href="https://kassa.yandex.ru/payments#cards" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-1.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cards" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-2.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cards" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-3.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cards" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-4.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cards" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-22.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#emoney" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-5.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#emoney" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-6.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#emoney" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-7.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#bank" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-8.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#bank" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-9.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#bank" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-10.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#bank" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-11.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#phone" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-12.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#phone" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-13.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#phone" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-14.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#phone" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-21.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#credit" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-16.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cash" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-18.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cash" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-19.png" alt="Alt">\n'+
//'            </a>\n'+
//'            <a href="https://kassa.yandex.ru/payments#cash" target="_blank" class="payment__item">\n'+
//'              <img src="http://xn--80ahqgegdcb.xn--p1ai/assets/images/pay-icons/pay-20.png" alt="Alt">\n'+
//'            </a>\n'

  ctx.editMessageText(ctx.session.value, markup).catch(() => undefined)

}