jQuery(document).ready(function ($) {
    // Инициализация datepicker
    $('#birth_date').datepicker({
        autoHide: true,
        autoClose: true,
        showEvent: ['focus','click'],
        position: 'bottom left'
    });

    // Маска для телефона
    $.mask.definitions['~'] = "[+-]";
    $('#phone').mask("+7 (999) 999-99-99");

    $('#akvt-submit-button').on('click', function () {

        if (! validateApplicantsForm()) {
            $('#error-message').prop('hidden', false);
            return;
        }
        $('#error-message').prop('hidden', true);

        var data = collectData();

        $('.akvt-loader').prop('hidden', false);

        $.ajax({
            url: akvt_ajax.url,
            data: data,
            processData: false,
            contentType: false,
            dataType: 'json',
            type: 'POST',
            success: function (response) {
                $('.akvt-loader').prop('hidden', true);
                if (response.status === true) {
                    $('#success-message').prop('hidden', false);
                } else {
                    $('#error-message').text("Произошла ошибка! " + response.error)
                                        .prop('hidden', false);
                }
            },
            error: function (xhr, status, error) {
                $('.akvt-loader').prop('hidden', true);
                $('#error-message').text("AJAX error: " + error).prop('hidden', false);
            }
        });
    });

    function validateApplicantsForm() {
        var rules = {
            email:      { required: true, email: true },
            name:       { required: true, min: 2 },
            surname:    { required: true, min: 2 },
            patronymic: { required: false, min: 2 },
            birth_date: { required: true, date: 'dmy' },
            life_place: { required: false, min: 5 },
            phone:      { required: true, format: /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/ }
        };

        var results = {
            surname:    approve.value($("#surname").val(), rules.surname),
            name:       approve.value($("#name").val(), rules.name),
            email:      approve.value($("#email").val(), rules.email),
            birth_date: approve.value($("#birth_date").val(), rules.birth_date),
            phone:      approve.value($("#phone").val(), rules.phone),
            files:      validateFiles($("#application-copy").prop('files')) &&
                        validateFiles($("#diploma-copy").prop('files')) &&
                        validateFiles($("#passport-copy").prop('files')) &&
                        validateFiles($("#privacy-consent-copy").prop('files'))
        };

        var failed = [];
        Object.keys(results).forEach(function(key){
            var val = results[key];
            if (typeof val === 'object') {
                if (!val.approved) failed.push(key + ' (' + (val.error||'invalid') + ')');
            } else {
                if (!val) failed.push(key);
            }
        });

        if (failed.length) {
            return false;
        }
        return true;
    }

    function validateFiles(files) {
        var names = $.map(files, function(val) { return val.name; });
        var ok = true;
        names.forEach(function(n){
            var ext = n.split('.').pop().toLowerCase();
            if ($.inArray(ext, ['png','jpg','jpeg','pdf']) === -1) ok = false;
        });
        return ok;
    }

    function appendFilesToFormData(selector, formData, fieldName) {
        var files = $(selector).prop('files');
        for (var i = 0; i < files.length; i++) {
            formData.append(fieldName + '[]', files[i]);
        }
    }

    function collectData() {
        var formData = new FormData();

        // файлы
        appendFilesToFormData("#application-copy", formData, 'application_copy');
        appendFilesToFormData("#diploma-copy",     formData, 'diploma_copy');
        appendFilesToFormData("#passport-copy",    formData, 'passport_copy');
        appendFilesToFormData("#privacy-consent-copy", formData, 'privacy_consent_copy');

        // остальные поля
        formData.append('surname',     $("#surname").val());
        formData.append('name',        $("#name").val());
        formData.append('patronymic',  $("#patronymic").val());
        formData.append('email',       $("#email").val());
        formData.append('birth_date',  $("#birth_date").val());
        formData.append('phone',       $("#phone").val());
        formData.append('sex',         $("#sex").val());
        formData.append('citizenship', $("#citizenship").val());
        formData.append('life_place',  $("#life_place").val());

        // Google reCAPTCHA
        formData.append('g-recaptcha-response',
                        $('textarea[name="g-recaptcha-response"]').val()
        );

        formData.append('nonce',
                        $('#akvt-submit-button').attr("wp-nonce")
        );
        formData.append('action', 'akvt_form_handler');

        return formData;
    }
});
