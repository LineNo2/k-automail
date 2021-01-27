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
    $('#search-result-counter').empty();
    $('#unit-result-wrap').empty();
    $('#result-send').attr('class', 'slideUp');
    switch (type) {
        case 0:
            $('#training-unit').val(info);
            // $('#training-unit').attr('disabled', 'disabled');
            $('#training-unit').addClass('fixed-inputbox');
            $('#search-result-wrap').empty();
            $('#search-reset-wrap').removeAttr('class');
            break;
        case 1:
            $('#training-school').val(info);
            // $('#training-school').attr('disabled', 'disabled');
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
    // $('#training-unit').removeAttr('disabled');
    $('#training-unit').removeClass('fixed-inputbox');
    $('#school-result-wrap').empty();
    $('#training-school').val('');
    // $('#training-school').removeAttr('disabled');
    $('#training-school').removeClass('fixed-inputbox');
    $('#search-reset-wrap').attr('class', 'before-slideup');
    $('#result-send').attr('class', 'info-hidden');
    $('#search-result-wrap').empty();
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
    console.log(txt)
    arr.forEach(elem => {
        if (elem.search(txt) > -1) {
            cnt++;
            result += '<div class="result-wrap" onclick="set_detailed(' + typeN + ',\'';
            result += elem + '\');get_scroll_alert();">';
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
    console.log('temp : ' + temp)
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
        arr[i].innerText = '';
    }
    for (let i = 0; i < stack.length; i++) {
        arr[stack[i]].innerText = i + 1;
    }
}
function validation(option, id) {
    let flag = 0;
    switch (option) {
        case 0://name
            if (($(id).val().match(/[가-힣]/gi) != null) && $(id).val().match(/[가-힣]/gi).length === $(id).val().length && $(id).val().length >= 2) {
                flag = 1;
                error_arr[0] = 0;
            }
            else if ($(id).val().length === 0) {
                flag = 0;
                error_arr[0] = 1;
            }
            else {
                flag = -1;
                error_arr[0] = 1;
            }
            break;
        case 1://date1
            if (($(id).val().match(/[0-9]/gi) != null) && $(id).val().match(/[0-9]/gi).length === $(id).val().length && $(id).val().length === 8) {
                flag = 1; error_arr[1] = 0;
            }
            else if ($(id).val().length === 0) { flag = 0; error_arr[1] = 1; }
            else { flag = -1; error_arr[1] = 1; }
            break;
        case 2:
            if ($(id + "-warning")[0].className.search('slideUp') > -1) {
                $(id + "-warning").addClass('slideDown');
                setTimeout(() => {
                    $(id + "-warning").attr('class', 'info-hidden');
                }, 801)
            }
            if (($(id).val().match(/[0-9]/gi) != null) && $(id).val().match(/[0-9]/gi).length === $(id).val().length && $(id).val().length === 8) {
                let curdate = new Date();
                let dateStr = $(id).val().slice(0, 4) + '-' + $(id).val().slice(4, 6) + '-' + $(id).val().slice(6, 8);
                let enterdate = new Date(dateStr);
                let timedif = enterdate - curdate;
                if (timedif <= 2592000000 && -2592000000 <= timedif) {
                    flag = 1;
                    error_arr[2] = 0;
                }
                else {
                    flag = -2;
                    error_arr[2] = 2;
                }
            }
            else if ($(id).val().length === 0) { flag = 0; error_arr[2] = 1; }
            else { flag = -1; error_arr[2] = 1; }
            break;
        case 3:
            if ($(id + "-warning")[0].className.search('slideUp') > -1) {
                $(id + "-warning").addClass('slideDown');
                setTimeout(() => {
                    $(id + "-warning").attr('class', 'info-hidden');
                }, 801)
            }
            if ($('#password_').val().length < 4 || $('#password_').val().length > 8) {
                error_arr[5] = 2;
                flag = -2;
            } else {
                if ($('#password_').val() === $('#password-check').val()) {
                    error_arr[5] = 0;
                    flag = 1;
                }
                else {
                    error_arr[5] = 1;
                    flag = -1;
                }
            }
            break;
    }
    switch (flag) {
        case 1:
            $(id + '-valid')[0].className = "fas fa-check valid-check";
            $(id + '-valid').attr('style', 'color:#77dd77;');
            break;
        case 0:
            $(id + '-valid')[0].className = "fas valid-check"
            break;
        case -2:
            $(id + "-warning").attr('class', 'slideUp');
        case -1:
            $(id + '-valid')[0].className = "fas fa-times valid-check"
            $(id + '-valid').attr('style', 'color:#ff2424;');
            break;
    }
    $(id).attr('class')
}

function print_error() {
    if ($('#submit')[0].className.search('slideUp') > -1) {
        $('#submit').addClass('slideDown');
        setTimeout(() => {
            $('#submit').attr('class', 'darkButton customButton detailed-hidden');
        }, 801)
    }
    if (error_arr[0] | error_arr[1] | error_arr[2] | error_arr[3] | error_arr[4] | error_arr[5]) {
        let errorHTML = '';
        let cnt = 0;
        for (let i = 0; i < error_arr.length; i++) {
            if (error_arr[i]) {
                cnt++;
                if (Object.values(error_msg[i])[0].length > 2) {
                    errorHTML += ' <i class="fas fa-exclamation-triangle"></i>' + error_msg[i][error_arr[i] - 1] + '<br>';
                } else {
                    errorHTML += ' <i class="fas fa-exclamation-triangle"></i>' + error_msg[i] + '<br>';
                }
            }
        }
        $('#verify-result-print')[0].innerHTML = errorHTML;
        $('#verify-result-print')[0].className = "slideUp status-invalid";
        setTimeout(() => {
            $('#verify-result-print')[0].className = " status-invalid";
        }
            , 1000)
    }
    else {
        $('#verify-result-print')[0].innerHTML = '<i class="fas fa-check-square">제출 가능합니다.</i>';
        $('#verify-result-print')[0].className = "slideUp status-valid";
        get_scroll_alert();
        $('#submit')[0].className = "slideUp darkButton customButton";
        setTimeout(() => {
            $('#verify-result-print')[0].className = "status-valid";
            get_focus('submit')
        }, 1000)
    }
}

function ajaxSubmit() {
    $('#loading-background').attr('style', '');
    $.ajax({
        url: "/submit",
        data: {
            "soldierName": $('#soldier-name').val(),
            "soldierBirth": $('#soldier-birth').val(),
            "enterdate": $('#enterdate').val(),
            "maxMail": $('#maxMail').val(),
            "yna": $('#yna').val(),
            "lol": $('#lol').val(),
            "kbo": $('#kbo').val(),
            "wfb": $('#wfb').val(),
            "type": $('#type').val(),
            "training": ($('#training-unit').val() === undefined ? $('#training-school').val() : $('#training-unit').val()),
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