function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}

function kakkoii_function() {
    $('.kakkoii-counter-number').each(function () {
        var $this = $(this);
        jQuery({ Counter: 0 }).animate({ Counter: $this.text() }, {
            duration: 2000,
            easing: 'swing',
            step: function () {
                $this.text(Math.ceil(this.Counter));
            }
        });
    });
}

let tf = 0;

window.onscroll = function () {
    if (isInViewport($('#kakkoii-counter')[0]) && !tf) {
        kakkoii_function()
        tf = 1;
    }
}

function popup_up() {
    $('#submit-popup-title').html('수정 기능을 <br> 안만들었습니다..');
    $("#submit-popup-button").val('아..예..');
    $('#popup-box-background').css('display', 'block');
    $('#submit-popup').attr('class', 'popup-box slideUp');
    $('#submit-popup-button').attr('tabindex', '0');
}

function popup_down() {
    $('#submit-popup').attr('class', 'popup-box slideDown');
    $('#submit-popup-button').attr('tabindex', '-1');
    $('#popup-box-background').css('display', 'none');
    setTimeout(() => {
        $('#submit-popup').attr('class', 'popup-box detailed-hidden');
    }, 800);
}

