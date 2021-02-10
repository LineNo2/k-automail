function formSubmit() {
    $('#loading-background').attr('style', '');
    validation(0, '#soldier-name');
    validation(1, '#soldier-birth');
    validation(5, '#enterdate');
    if (error_arr[0] | error_arr[1] | error_arr[2] | error_arr[3] | error_arr[4] | error_arr[5]) {
        $('#loading-background').attr('style', 'display: none;');
        print_error();
        return;
    }
    else {
        $('#soldierInfo').submit();
    }
}