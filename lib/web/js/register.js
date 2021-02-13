function scrollUpEffector() {
    document.getElementById("titleText").className = "slideUp";
    setTimeout(() => {
        document.getElementById("mainBlock").className = "slideUp";

    }, 1000)
}

function typeTextEffector(type) {
    $('.detailed-wrap').each(function () {
        this.className = 'detailed-wrap detailed-hidden';
    });
    $(type).attr('class', 'detailed-wrap slideUp');
    reset_detailed();
    get_scroll_alert();
    $('#search-reset').attr('tabindex', '0');
}

function infoTextEffector(info_) {
    info = Math.pow(2, info_);

    if (interest & info) {
        interest -= info;
        priority_set(info_);
    }
    else {
        interest += info;
        stack.push(info_);
    }
    for (let i = 0; i < infoArr.length; i++) {
        if (interest & Math.pow(2, i)) {
            $(infoArr[i] + '-detail')[0].className = 'slideUp';

        }
        else {
            if ($(infoArr[i] + '-detail')[0].className.search('info-hidden') === -1) {
                $(infoArr[i] + '-detail')[0].className = 'slideDown info-hidden';
            }
        }
    }
    priority_print();
    control_mail_max();
}

function resetTextEffector() {
    $('.detailed-wrap').each(function () {
        this.className = 'detailed-wrap detailed-hidden';
    });
}

function detail_display(type) {
    $('#type').val(type);
    $('#detail-display')[0].innerHTML = typeDisplayArr[type];
    $('#detail-display')[0].className = 'slideUp';
    setTimeout(() => {
        $('#detail-display')[0].className = '';
    }, 1000);
}

function set_detailed(type, info) {
    error_arr[4] = 0;
    get_scroll_alert();
    $('#search-result-counter').empty();
    $('#unit-result-wrap').empty();
    $('#result-send').attr('class', 'slideUp');
    $('#password_').attr('tabindex', '0');
    $('#password-check').attr('tabindex', '0');
    $('#verify').attr('tabindex', '0');
    switch (type) {
        case 0:
            $('#training-unit').val(info);
            $('#training-unit').attr('readonly', '');
            $('#training-unit').addClass('fixed-inputbox');
            $('#search-result-wrap').empty();
            $('#search-reset-wrap').removeAttr('class');
            break;
        case 1:
            $('#training-school').val(info);
            $('#training-school').attr('readonly', '');
            $('#training-school').addClass('fixed-inputbox');
            $('#search-result-wrap').empty();
            $('#search-reset-wrap').removeAttr('class');
            break;
    }
}

function reset_detailed() {
    error_arr[4] = 1;
    $('#search-result-counter').empty()
    $('#training-unit').val('');
    $('#training-unit').removeAttr('readonly');
    $('#training-unit').removeClass('fixed-inputbox');
    $('#school-result-wrap').empty();
    $('#training-school').val('');
    $('#training-school').removeAttr('readonly');
    $('#training-school').removeClass('fixed-inputbox');
    $('#search-reset-wrap').attr('class', 'before-slideup');
    $('#result-send').attr('class', 'info-hidden');
    $('#search-result-wrap').empty();
    $('#password_').attr('tabindex', '-1');
    $('#password-check').attr('tabindex', '-1');
    $('#search-reset').attr('tabindex', '-1');
    $('#verify').attr('tabindex', '-1');
}

function search_detailed(typeN) {
    let type = (typeN === 0 ? 'unit' : 'school');
    let arr = (typeN === 0 ? unitArr : schoolArr);
    let txt = $('#training-' + type).val();
    let cnt = 0;
    let result = '';
    $('#search-result-wrap').empty();
    $('#search-result-counter').empty();
    document.getElementById('search-result-wrap').className = '';
    // console.log(txt)
    arr.forEach(elem => {
        if (elem.search(txt) > -1) {
            cnt++;
            result += '<div class="result-wrap" onclick="set_detailed(' + typeN + ',\'';
            result += elem + '\');" tabindex="0">';
            result += elem + "</div>";
        }
    })
    if (result.length === 0) {
        $('#search-result-counter').append("검색 결과가 없습니다.");
    } else {
        $('#search-result-counter').append(cnt + "개의 검색 결과");
        $('#search-result-wrap').append(result);
    }
    document.getElementById('search-result-wrap').className = 'slideUp';
    setTimeout(() => { document.getElementById('search-result-wrap').className = ''; }, 1000)

}

function get_focus(id) {
    document.getElementById(id).scrollIntoView({ "behavior": "smooth", "block": "center" })
}

function control_count(op) {
    switch (op) {
        case 0:
            if (maxMail > 1) {
                maxMail--;
            }
            break;
        case 1:
            if (maxMail < 10) {
                maxMail++;
            }
            break;
    }
    $('#maxMail').val(maxMail);
    control_mail_max();
}
function control_mail_max() {
    let lolflag = 0;
    let temp = maxMail;
    for (let i = 0; i < mailcount.length; i++) {
        backup_mailcount[i] = mailcount[i];
        mailcount[i] = 0;
    }

    for (let i = 0; i < stack.length; i++) {
        $(infoArr[stack[i]]).val(i);
        if (stack[i] === 1) {
            lolflag = 1;
            continue;
        }
        if (temp > 0) {
            mailcount[stack[i]] = 1;
            temp--;
        }
        else {
            mailcount[stack[i]] = 0;
        }
    }
    if (lolflag) {
        mailcount[1] = temp;
        temp = 0;
    }
    // console.log('temp : ' + temp)
    if (temp) {
        $("#warning-detail strong")[0].innerText = temp;
        $("#warning-detail").attr('class', 'slideUp');
        error_arr[3] = 2;
    }
    else {
        error_arr[3] = 0;
        if ($("#warning-detail")[0].className.search('slideUp') > -1) {
            $("#warning-detail").addClass('slideDown');
            setTimeout(() => {
                $("#warning-detail").attr('class', 'info-hidden');
            }, 801)
        }
    }

    for (let i = 0; i < infoArr.length; i++) {
        $(infoArr[i] + '-count').attr('class', 'each-count-display');

        if (mailcount[i] > backup_mailcount[i]) {
            $(infoArr[i] + '-count').text(mailcount[i]);
            $(infoArr[i] + '-count').addClass('slideUp');
            setTimeout(() => { $(infoArr[i] + '-count').removeClass('slideUp') }, 801)
        }
        else if (mailcount[i] < backup_mailcount[i]) {
            $(infoArr[i] + '-count').addClass('slideDown');
            setTimeout(() => {
                $(infoArr[i] + '-count').removeClass('slideDown');
                $(infoArr[i] + '-count').text(mailcount[i]);
            }, 801)
        }
    }
}
function priority_set(id) {
    let flag = 0;
    for (let i = 0; i < stack.length; i++) {
        if (flag === 0 && stack[i] === id) {
            flag = 1;
            continue;
        }
        if (flag) {
            stack[i - 1] = stack[i];
        }
    }
    stack.pop();
}
function priority_print() {
    let arr = $('.number-container');
    for (let i = 0; i < arr.length; i++) {
        arr[i].className = 'number-container info-hidden';
    }
    for (let i = 0; i < stack.length; i++) {
        arr[stack[i]].className = 'number-container';
    }
}

function ajaxSubmit() {
    $('#loading-background').attr('style', '');
    validation(0, '#soldier-name');
    validation(1, '#soldier-birth');
    validation(2, '#enterdate');
    validation(3, '#password-check');
    if (error_arr[0] | error_arr[1] | error_arr[2] | error_arr[3] | error_arr[4] | error_arr[5]) {
        $('#loading-background').attr('style', 'display: none;');
        print_error();
        return;
    }
    else {
        $.ajax({
            url: "/submit",
            data: {
                "submit-type": 0,
                "soldierName": $('#soldier-name').val(),
                "soldierBirth": $('#soldier-birth').val(),
                "enterdate": $('#enterdate').val(),
                "maxMail": $('#maxMail').val(),
                "interested": (($('#yna').is(':checked') ? 4 : 0) + ($('#lol').is(':checked') ? 8 : 0) + ($('#kbo').is(':checked') ? 2 : 0) + ($('#wfb').is(':checked') ? 1 : 0)),
                "type": $('#type').val(),
                "training": ($('#training-unit').val() === undefined ? schoolArr.indexOf($('#training-school').val()) : unitArr.indexOf($('#training-unit').val())),
                "password": $('#password_').val()

            },
            type: "POST",
            success: function (result) {
                $(".get-script").html(result);
                $('#loading-background').attr('style', 'display: none;');
            },
            error: function () {
            }
        });
    }
}


function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth));
}
var wrongAnswer = document.getElementsByClassName('wrongAnswer');
function checkWrongAnswerViewed() {
    for (var i = 0; i < wrongAnswer.length; i++) {
        if (isInViewport(wrongAnswer[i])) wrongAnswer[i].className = 'glow wrongAnswer';
        else { wrongAnswer[i].className = 'wrongAnswer'; }
    }
}
var currentAnswer = 0;
function nextAnswer() {
    if (currentAnswer == wrongAnswer.length - 1) {
        document.getElementsByClassName('wrongAnswer')[currentAnswer].scrollIntoView({ "behavior": "smooth", "block": "center" });
        document.getElementById('top_button').innerHTML = "SHOW";
        document.getElementById('top_button').setAttribute('onclick', "window.scroll({ top: document.body.offsetHeight, behavior: 'smooth' });")
    }
    else {
        document.getElementsByClassName('wrongAnswer')[currentAnswer].scrollIntoView({ "behavior": "smooth", "block": "center" });
        document.getElementById('top_button').innerHTML = currentAnswer + 1; currentAnswer++;
    }
}

function get_scroll_alert() {
    $('#scroll-sign')[0].className = "slideDown";
    setTimeout(() => {
        $('#scroll-sign')[0].className = "detailed-hidden";
    }, 900)
}