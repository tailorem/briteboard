$(function() {

  let templateId = 0;

  $('.template-card').on('click', function(e) {
    $('.selected-card').removeClass('selected-card');
    $(this).addClass('selected-card');
    templateId = $(this).attr('id');
    $('input.template-input').val(templateId);
    // console.log(templateId);
    // console.log($('input.template-input').val());
  });

});
