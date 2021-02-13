let error_msg = ['이름이 정확하지 않습니다.', '생년월일이 정확하지 않습니다.', ['입영일자가 정확하지 않습니다.', '입영일자 검색 조건에 해당하지 않습니다.'], ['편지 장수를 설정하지 않았습니다.', '남은 편지가 있습니다.'], '군 세부정보가 입력되지 않았습니다.', ['재입력한 비밀번호가 옳지 않습니다.', '비밀번호의 길이 제한이 지켜지지 않았습니다']]

function validation(option, id) {
    reset_popup = function (id) {
        if ($(id + "-warning")[0].className.search('slideUp') > -1) {
            $(id + "-warning").addClass('slideDown');
            setTimeout(() => {
                $(id + "-warning").attr('class', 'info-hidden');
            }, 801)
        }
    }
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
            reset_popup(id);
            if (($(id).val().match(/[0-9]/gi) != null) && $(id).val().match(/[0-9]/gi).length === $(id).val().length && $(id).val().length === 8) {
                let curdate = new Date();
                let dateStr = $(id).val().slice(0, 4) + '-' + $(id).val().slice(4, 6) + '-' + $(id).val().slice(6, 8);
                let enterdate = new Date(dateStr);
                let timedif = enterdate - curdate;
                let month = 2592000000;
                if (timedif <= month && month * (-1) <= timedif) {
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
            reset_popup(id);
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
        case 5://enterdate-2
            if (($(id).val().match(/[0-9]/gi) != null) && $(id).val().match(/[0-9]/gi).length === $(id).val().length && $(id).val().length === 8) {
                flag = 1; error_arr[2] = 0;
            }
            else if ($(id).val().length === 0) { flag = 0; error_arr[2] = 1; }
            else { flag = -1; error_arr[2] = 1; }
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
    // if ($('#submit')[0].className.search('slideUp') > -1) {
    //     $('#submit').addClass('slideDown');
    //     setTimeout(() => {
    //         $('#submit').attr('class', 'darkButton customButton detailed-hidden');
    //     }, 801)
    // }
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
        $('#verify').attr('tabindex', '-1');
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
        $('#verify').attr('tabindex', '0');
        get_scroll_alert();
        $('#submit')[0].className = "slideUp darkButton customButton";
        setTimeout(() => {
            $('#verify-result-print')[0].className = "status-valid";
            get_focus('submit')
        }, 1000)
    }
}