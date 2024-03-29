// REWRITE: some urls need the locale prefix, for example images
window.Upgrade = {
  current_locale: function() {
    return document.location.href.match(/^https?:\/\/[^\/]+\/([a-z]+)/)[1];
  },
  sanitize: function(newValues) {
    if ('order' in newValues) {
      newValues['page'] = null;
      var o = newValues['order'];
      newValues['direction'] = {
        'relevance': 'desc',
        'rating_average': 'desc',
        'rating_count': 'desc'
      }[o] || 'asc';
    }

    if ('per_page' in newValues) {
      newValues['page'] = null;
    }

    return newValues;
  },
  setParam: function(key, value) {
    var opts = {};
    opts[key] = value;
    Upgrade.setParams(opts);
  },
  setParams: function(newValues) {
    newValues = Upgrade.sanitize(newValues);

    var newUrl = window.location.origin;
    newUrl += window.location.pathname;
    var q = window.location.search;
    var h = window.location.hash;

    var sp = new URLSearchParams(q);
    for (var key in newValues) {
      var value = newValues[key];
      if (value === null) {
        sp.delete(key)
      } else {
        sp.set(key, value);
      }
    }

    if (sp.toString() !== '') {
      q = '?' + sp.toString();
    } else {
      q = '';
    }

    newUrl += q + h;
    if (newUrl != window.location.href) {
      window.location.href = newUrl;
    }
  },
  SourceList: {
    init: function(list) {
      var groups = list.find('.pm-groups > li');
      for (var i = 0; i < groups.length; i++) {
        var group = groups.slice(i, i + 1);
        Upgrade.SourceList.updateGroupCheckbox(group);
      }
      Upgrade.SourceList.updateAllCheckbox(list);
      Upgrade.SourceList.updateCounts(list);
    },
    updateCounts: function(list) {
      // count and update total selected databases
      //var count = list.find('.pm-databases input[type=checkbox]:checked').length;

      var dataIds = [];
      list.find('.pm-databases input[type=checkbox]:checked').map(function(i, el){
        dataIds.push(jQuery(el).attr("data-id"))
      });

      // distinct ids necessary since the same database can be listed in different groups
      var count = new Set(dataIds).size;

      list.find('> .pm-header .pm-amount').html(count);

      // count database selections and update group headers
      var groups = list.find('.pm-groups > li');
      for (var i = 0; i < groups.length; i++) {
        var group = jQuery(groups[i]);
        var total = group.find('.pm-databases input[type=checkbox]').length;
        var count = group.find('.pm-databases input[type=checkbox]:checked').length;
        group.find('> .pm-header .pm-amount').text(' (' + count + '/' + total + ')');
      }
    },
    updateGroupCheckbox: function(group) {
      var result = true;
      var checkboxes = group.find('.pm-databases input[type=checkbox]');
      for (var j = 0; j < checkboxes.length; j++) {
        var checkbox = checkboxes.slice(j, j + 1);
        if (!checkbox.prop('checked')) {
          result = false;
          break;
        }
      }

      var target = group.find('.pm-header input[type=checkbox]');
      target.prop('checked', result);
    },
    updateAllCheckbox: function(list) {
      var result = true;
      var groups = list.find('.pm-groups > li');
      for (var i = 0; i < groups.length; i++) {
        var group = groups.slice(i, i + 1);
        var checkbox = group.find('> .pm-header input[type=checkbox]');
        if (!checkbox.prop('checked')) {
          result = false;
          break;
        }
      }

      var target = list.find('> .pm-body > .pm-check input[type=checkbox]');
      target.prop('checked', result);
    },
    updateDatabaseCheckboxes: function(database){
      var dataId = database.attr('data-id');
      var checked = database.prop('checked');

      jQuery(".pm-source-list .pm-databases .pm-check input[data-id=" + dataId + "]").each(function(i, el){
        jQuery(el).prop('checked', checked);
      });
    }
  },
  activateStoreImageButtons: function() {
    // only enable/disable collective store button
    // var buttons = jQuery('.popup_toggle');
    var buttons = jQuery('.store_controls .popup_toggle, .pm-edit-selected');
    var inputs = jQuery('.image_check_box input:checked');
    if (inputs.length > 0) {
      buttons.removeClass('disabled');
    } else {
      buttons.addClass('disabled');
    }
  },
  displaySourceQuota: function(sourceKind) {
    if (sourceKind.find("option:selected").attr("value") == "User database") {
      jQuery("tr").has("label[for='source_quota']").show();
    }
    else {
      jQuery("tr").has("label[for='source_quota']").hide();
    }
  }
};

// box delete xhr success (announcement)
jQuery(document).on('ajax:success', '#announcements [data-method=DELETE]', function(event, data, status, xhr) {
  jQuery('#announcements').hide();
});

// jQuery(document).on('ajax:success', '.on-source-list', function(event, data, status, xhr) {
//   data = event.originalEvent.detail[2].responseText;
//   let element = jQuery('#source-list-table-body')
//   element.html(data);
//   sourceListWrap();
// });

jQuery(document).on('ajax:success', '.on-rating-done', function(event, data, status, xhr) {
  // for some reason, the args are not set as expected
  let html = event.originalEvent.detail[2].responseText;
  jQuery('#rating').html(html);
});

// list and gallery view switch

jQuery(document).ready(function(event) {
  //if (jQuery('#link-to-gallery').hasClass('inactive')) {
  //  updateToGalleryView();
  //}

  var list = jQuery('.pm-source-list');
  if (list.length != 0) {
    Upgrade.SourceList.init(list);
  }
});

/*function updateToListView(event) {
  event.preventDefault();
  let toListLink = jQuery('[id=link-to-list]');
  let toGalleryLink = jQuery('[id=link-to-gallery]');

  toListLink.toggleClass('inactive');
  toGalleryLink.removeClass('inactive');
  jQuery('.search-link').each(function(i, el) {
    el = jQuery(el);
    let href = el.attr("href");
    el.attr("href", href.replace(/(view=)[a-z]+/ig, 'view=list'));
  });
  jQuery("input[name='view']").attr('value', 'list');
  jQuery('.list_row').attr('style', 'width: 100%;');
  jQuery('.list_row').css({width: '100%'});
  jQuery('.list_row.odd').css({backgroundColor: '#303030'});
  jQuery('.gallery-sort-value').hide();
  jQuery('.comment-div-empty').hide();
  jQuery('.metadata').attr('style', 'height: *; width: *;').show();
}

function updateToGalleryView(event) {
  if (event) {event.preventDefault()}
  let toListLink = jQuery('[id=link-to-list]');
  let toGalleryLink = jQuery('[id=link-to-gallery]');

  toListLink.removeClass('inactive');
  toGalleryLink.addClass('inactive');
  jQuery('.search-link').each(function(i, el) {
    el = jQuery(el);
    let href = el.attr("href");
    el.attr("href", href.replace(/(view=)[a-z]+/ig, 'view=gallery'));
  });
  jQuery("input[name='view']").attr('value', 'gallery');
  //jQuery('.list_row').attr('style', 'width: 33%;');
  jQuery('.list_row').css({
    width: '33%',
    background: 'initial'
  });
  // REWRITE: ids are now generated differently by rails
  // sort_value = $('sort[field]').value;
  let sort_value = jQuery('#sort_field').val();
  if (sort_value != 'artist' || sort_value != 'title' || sort_value != 'location' || sort_value == 'date' || sort_value == 'credits') {
    sort_value = 'title';
  }
  let gallery_sort_value = [];
  jQuery('.' + sort_value + '-field').each(function(i, el) {
    gallery_sort_value[i] = el.innerText;
    return true;
  });
  jQuery('.gallery-sort-value').each(function(i, el) {
    el = jQuery(el);
    el.html(gallery_sort_value[i].substring(0, 25) + "...");
    el.attr('title', gallery_sort_value[i]);
    el.show();
    return true;
  });
  jQuery('.comment-div-empty').show();
  jQuery('.metadata').attr('style', 'height: 0px; width: 0px;').hide();
}

jQuery(document).on('click', '[id=link-to-gallery]', updateToGalleryView);
jQuery(document).on('click', '[id=link-to-list]', updateToListView);
*/

// make the new pagination view work when loaded via ajax
// jQuery(document).on('click', '.box_content .pagination a', function(event){
//   event.preventDefault();
//   let a = jQuery(event.target);
//   let url = a.attr('href');

//   jQuery.ajax({
//     url: url,
//     success: function(data) {
//       a.parents('.box_content').html(data);
//     }
//   })
// });

jQuery(document).on('change', '.pm-select-all', function(event) {
  var checked = jQuery(event.target).prop('checked');

  var inputs = jQuery('.image_check_box input');
  for (var i = 0; i < inputs.length; i++) {
    var input = jQuery(inputs[i])
    if (checked ^ jQuery(input).prop('checked')) {
      input.click();
    }
  }

  Upgrade.activateStoreImageButtons();
})

jQuery(document).on('change', '#institution_master_top, #institution_master_bottom', function(event) {
  var checked = jQuery(event.target).prop('checked');
  var inputs = jQuery('input[type=checkbox].institution_list_item')
  var masters = jQuery('#institution_master_top, #institution_master_bottom')

  inputs.prop('checked', checked)
  masters.prop('checked', checked)
})

jQuery(document).on('change', '.image_check_box input', function(event) {
  Upgrade.activateStoreImageButtons();
})

jQuery(document).on('change', 'select[pm-to-param]', function(event) {
  var e = jQuery(event.target);
  var key = e.attr('pm-to-param');
  var value = e.val();
  Upgrade.setParam(key, value);
})

jQuery(document).on('click', 'a[pm-to-param]', function(event) {
  event.preventDefault();
  var e = jQuery(event.currentTarget);
  // var key = e.attr('pm-to-param');
  // var value = e.attr('pm-value');
  //Upgrade.setParam(key, value);

  var db_group_key = e.attr('pm-to-param');
  var db_group_value = e.attr('pm-value');
  var expand_list_key = 'expand_list';
  var expand_list_value = true;

  var opts = {};
  opts[db_group_key] = db_group_value;
  opts[expand_list_key] = expand_list_value;
  Upgrade.setParams(opts);
})

jQuery(document).on('keydown', 'input[pm-to-param]', function(event) {
  if (event.which == 13) {
    event.preventDefault();
    var e = jQuery(event.target);
    var key = e.attr('pm-to-param');
    var value = e.val();
    Upgrade.setParam(key, value);
  }
})

jQuery(document).on('click', '[pm-submit-to-param]', function(event) {
  event.preventDefault();
  var e = jQuery(event.target);
  var field = e.attr('pm-field');
  var key = e.attr('pm-submit-to-param');
  var value = jQuery("[name='" + field + "']").val();
  Upgrade.setParam(key, value);
})

jQuery(document).on('click', '.pm-pagination-go', function(event) {
  event.preventDefault();
  var e = jQuery(event.currentTarget);
  var field = e.parents('.pagination').find('input[name=page]');
  var value = field.val() || field.attr('placeholder');
  Upgrade.setParam('page', value);
})

// jQuery(document).on('click', '.toggle_zoom a', function(event) {
//   event.preventDefault();
//
//   var element = jQuery('div.zoom_link');
//   element.toggleClass('disabled');
//   element.toggleClass('enabled');
// });

// add image preloader vor image zoom versions (#1396)
jQuery(document).ready(function(event) {
  var images = document.querySelectorAll("img[_zoom_src]")
  var urls = [...images].map(i => i.getAttribute('_zoom_src'))
  var uniq = [...new Set(urls)]

  var loader = document.createElement('div')
  loader.style.backgroundImage = uniq.map(u => `url(${u})`).join(', ')

  var body = document.querySelector('body')
  body.append(loader)
})

jQuery(document).on('mouseover', '.image_list [_zoom_src]', function(event) {
  var img = jQuery(event.target);

  var enabled = jQuery('div.zoom_link').hasClass('enabled');

  if (enabled) {
    if (!img.hasClass('pm-zoomed')) {
      // we do this so that the img element doesn't get width == height == 0 for
      // a short when the src valus is exchanged period because that triggers
      // the below mouseout and the img flickers visibly
      img.css('min-width', img.width());
      img.css('min-height', img.height());

      var tmp = img.attr('_zoom_src');
      img.attr('_zoom_src', img.attr('src'));
      img.attr('src', tmp);
      img.addClass('pm-zoomed');
      img.addClass('pm-detached');
    }
  }
});

jQuery(document).on('mouseout', '.image_list [_zoom_src].pm-zoomed', function(event) {
  var enabled = jQuery('.toggle_zoom div.zoom_link').hasClass('enabled');

  if (enabled) {
    var img = jQuery(event.target);

    var tmp = img.attr('_zoom_src');
    img.attr('_zoom_src', img.attr('src'));
    img.attr('src', tmp);
    img.removeClass('pm-zoomed');

    var events = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd'
    img.one(events, function(event) {
      img.removeClass('pm-detached');
    });

  }
});

var selector = '.pm-source-list > .pm-body > .pm-check input[type=checkbox]';
jQuery(document).on('change', selector, function(event) {
  var e = jQuery(event.target);
  var checked = e.prop('checked');
  e.parents('.pm-source-list').find('input[type=checkbox]').prop('checked', checked);

  var list = e.parents('.pm-source-list');
  Upgrade.SourceList.updateCounts(list);
})

selector = '.pm-source-list .pm-groups > li > .pm-header .pm-check';
jQuery(document).on('change', selector, function(event) {
  var e = jQuery(event.target);
  var checked = e.prop('checked');

  // update other checkboxes for same database (databases may have several kewords)
   var databaseCheckboxes = e.parents('li').find('.pm-databases input[type=checkbox]');
   databaseCheckboxes.prop('checked', checked);
   databaseCheckboxes.each(function(i, el){
    Upgrade.SourceList.updateDatabaseCheckboxes(jQuery(el));
   });

  var list = e.parents('.pm-source-list');

  // update all group checkboxes
  var groups = list.find('.pm-groups > li');
  groups.each(function(i, group){
    Upgrade.SourceList.updateGroupCheckbox(jQuery(group));
  });

  Upgrade.SourceList.updateAllCheckbox(list);
  Upgrade.SourceList.updateCounts(list);
})

selector = '.pm-source-list .pm-databases .pm-check';
jQuery(document).on('change', selector, function(event) {
  var e = jQuery(event.target);

  // update all other checkboxes for same database (databases may have several kewords)
  Upgrade.SourceList.updateDatabaseCheckboxes(e);

  var list = e.parents('.pm-source-list');

  // update all group checkboxes
  var groups = list.find('.pm-groups > li');
  groups.each(function(i, group){
    Upgrade.SourceList.updateGroupCheckbox(jQuery(group));
  });

  Upgrade.SourceList.updateAllCheckbox(list);
  Upgrade.SourceList.updateCounts(list);
})

selector = '.pm-source-list > .pm-header .pm-toggle a';
jQuery(document).on('click', selector, function(event) {
  event.preventDefault();
  var list = jQuery(event.target).parents('.pm-source-list');
  list.toggleClass('pm-expand');
})

// selector = '.pm-source-list .pm-groups';
// jQuery(document).on('click', '.pm-source-list .pm-show > a', function(event) {
//   event.preventDefault();
//   var list = jQuery(event.target).parents('.pm-source-list');
//   list.toggleClass('pm-expand');
// })

selector = '.pm-source-list .pm-groups > li > .pm-header .pm-toggle';
jQuery(document).on('click', selector, function(event) {
  event.preventDefault();
  var e = jQuery(event.target);
  var group = e.parents('.pm-groups > li');
  group.toggleClass('pm-expand');
})

jQuery(document).on('click', '.pm-submit .button_middle', function(event) {
  var widget = jQuery(event.target).closest('.pm-submit');
  var submit = widget.find('input[type=submit]')
  if (submit.length == 1) {
    submit.click()
  } else {
    var form = jQuery(event.target).closest('form')
    form[0].submit()
  }
})

jQuery(document).on('click', '.row-adder', function(event) {
  window.ev = event;
  var target = jQuery(event.target);
  //var list = target.parents('table');
  var row = target.parents('tr');
  var clone = row.clone();
  var i = parseInt(row.find('input').attr('id').split('_')[2]) + 1;
  clone.find('input').
    attr('id', 'search_value_' + i).
    attr('name', 'search_value[' + i + ']').
    attr('tabindex', i + 1);
  row.find('.row-adder').remove();
  row.after(clone);
  //Pandora.Behaviour.apply(false, added_row);
})


/* section handling */

jQuery(document).on('click', '.pm-section .pm-toggle', function(event) {
  event.preventDefault();
  var section = jQuery(event.target).closest('.section_wrap');

  section.toggleClass('pm-expanded');
})


/* uploads: multi edit */

jQuery(document).on('click', '.pm-edit-selected .button_middle', function(event) {
  var url =
    Pandora.root_url + Upgrade.current_locale() + '/uploads/edit_selected';

  var params = jQuery(".image_list input[name='image[]']:checked").map(function(i, e) {
    var upload_id = jQuery(e).parents('.list_row').attr('data-upload-id');
    return 'uploads[]=' + upload_id;
  }).toArray();

  url += '?' + params.join('&');
  document.location.href = url;
})


/* comment handling */

jQuery(document).on('click', '.pm-new-comment', function(event) {
  event.preventDefault();
  var section = jQuery(event.target).closest('.section_wrap');
  var section_toggle = section.find('.section_toggle');
  var target = section.find('.pm-comments');

  if (!target.hasClass('pm-new')) {

    target.addClass('pm-new');

    if (!section.hasClass('pm-expanded')) {
      // the section can be expandend, so its not expanded
      section.addClass('pm-expanded');
    }
  } else {
    target.removeClass('pm-new');

    if (section.find('.comment').length == 0) {
      // there are no comments, so we close the section
      section.removeClass('pm-expanded');
    }
  }
})

jQuery(document).on('click', '.pm-edit-comment', function(event) {
  event.preventDefault();
  jQuery(event.target).closest('.comment').toggleClass('pm-edit');
})

jQuery(document).on('click', '.pm-reply-to-comment', function(event) {
  event.preventDefault();
  jQuery(event.target).closest('.comment').toggleClass('pm-reply-to');
})


/* "add to sidebar" handling */

// box delete xhr success (collection)
// jQuery(document).on('ajax:success', '.sidebar_box [data-method=DELETE]', function(event, data, status, xhr) {
//   // for some reason, the args are not set as expected
//   data = event.originalEvent.detail[2].responseText;
//   jQuery('#boxes').html(data);
// });

// // box add xhr success (image)
// jQuery(document).on('ajax:success', '.popup_footer a[data-method=POST]', function(event, data, status, xhr) {
//   // for some reason, the args are not set as expected
//   data = event.originalEvent.detail[2].responseText;
//   jQuery('#boxes').html(data);
// });

// // box add xhr success (collection)
// jQuery(document).on('ajax:success', '.collection-to-sidebar', function(event, data, status, xhr) {
//   // for some reason, the args are not set as expected
//   data = event.originalEvent.detail[2].responseText;
//   jQuery('#boxes').html(data);
// });

// // box add xhr success (collection)
// jQuery(document).on('ajax:complete', '.on-complete-apply-behavior', function(event, data, status, xhr) {
//   // for some reason, the args are not set as expected
//   data = event.originalEvent.detail[0].responseText;
//   // find first parent that specifies data-update attribute
//   let id = jQuery(event.target).parents('[data-update]').attr('data-update');
//   jQuery('#' + id).html(data);
//   Pandora.Behaviour.apply(true, id);
// });

class Boxes {
  constructor(selector) {
    this.root = jQuery(selector)

    this.render = this.render.bind(this)
    this.renderId = this.renderId.bind(this)

    this.onCreate = this.onCreate.bind(this)
    this.onDestroy = this.onDestroy.bind(this)
    this.onToggle = this.onToggle.bind(this)
    this.onReorder = this.onReorder.bind(this)
    this.onPaginate = this.onPaginate.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  fetchAll() {
    const url = '/' + Upgrade.current_locale() + '/boxes'
    return jQuery.ajax({url: url}).then(this.render)
  }

  fetchId(id, page = 1) {
    const url = '/' + Upgrade.current_locale() + '/boxes/' + id
    return jQuery.ajax({
      url: url,
      data: {page: page, per_page: 6}
    })
  }

  render(html) {
    this.root.html(html)
  }

  renderId(id, html) {
    const box = this.root.find(`.sidebar_box[data-id='${id}']`)
    // console.log(box)
    box.replaceWith(html)
  }

  destroy(id) {
    const url = '/' + Upgrade.current_locale() + '/boxes/' + id
    return jQuery.ajax({
      type: 'DELETE',
      url: url
    }).then(this.render)
  }

  create(type, id) {
    const url = '/' + Upgrade.current_locale() + '/boxes'
    return jQuery.ajax({
      type: 'POST',
      url: url,
      data: {
        box: {
          ref_type: type,
          [`${type}_id`]: id
        }
      }
    }).then(this.render)
  }

  toggle(id) {
    const url = `/${Upgrade.current_locale()}/boxes/${id}/toggle`
    return jQuery.ajax({
      type: 'POST',
      url: url
    }).then(this.render)
  }

  reorder(ids) {
    const url = `/${Upgrade.current_locale()}/boxes/reorder`
    return jQuery.ajax({
      type: 'POST',
      url: url,
      data: {ids: ids}
    })
  }

  onCreate(event) {
    event.preventDefault()

    var a = jQuery(event.currentTarget)
    var type = a.data('type')
    var id = a.data('id')

    this.create(type, id).then(this.render);
  }

  onDestroy(event) {
    event.preventDefault()

    var a = jQuery(event.currentTarget)
    var msg = a.data('pm-confirm')
    var id = a.data('id')

    if (window.confirm(msg)) {
      this.destroy(id).then(this.render)
    }
  }

  onToggle(event) {
    event.preventDefault();

    var a = jQuery(event.currentTarget)
    var id = a.data('id')

    this.toggle(id).then(this.render)
  }

  onReorder(event, ui) {
    const ids = this.root.
      find('.sidebar_box').
      toArray().
      map(e => e.getAttribute('data-id'))

    this.reorder(ids)
  }

  onPaginate(event) {
    event.preventDefault()

    var a = jQuery(event.currentTarget)
    var id = a.closest('.sidebar_box').data('id')
    var page = a.attr('href').match(/page=(\d+)/)[1]

    this.fetchId(id, page).then(html => {this.renderId(id, html)})
  }

  onSubmit(event) {
    event.preventDefault()
    event.stopImmediatePropagation()

    const form = jQuery(event.target).closest('form')
    const id = form.closest('.sidebar_box').data('id')
    const page = form.find('input[name=page]').val()

    this.fetchId(id, page).then(html => {this.renderId(id, html)})
  }

  init() {
    this.fetchAll()

    this.root.sortable({handle: '.box_handle', opacity: 0.5})
    this.root.on('sortupdate', this.onReorder)

    this.root.on('click', 'a.pm-from-sidebar', this.onDestroy)
    this.root.on('click', 'a.pm-toggle-box', this.onToggle)
    this.root.on('click', '.pagination a', this.onPaginate)
    this.root.on('submit', '.pagination form', this.onSubmit)
    this.root.on('click', '.pagination .button_middle', this.onSubmit)

    jQuery(document).on('click', 'a.pm-to-sidebar', this.onCreate)
  }
}


/* pagination */

// handle submit for pagination when triggerd via enter key
jQuery(document).on('submit', 'form.page_form', function(event) {
  event.preventDefault();
  var url = document.location.href;
  var newPage = jQuery(event.target).find('input[type=text]').val();

  if (url.match(/[\?\&]page=\d+/)) {
    url = url.replace(/([\?\&])page=\d+/, '$1page=' + newPage);
  } else {
    if (url.match(/\?/)) {
      url += '&page=' + newPage;
    } else {
      url += '?page=' + newPage;
    }
  }
  window.location.href = url;
});

// // we also need to handle the submit event for the sidebar pagination
// jQuery(document).on('click', '.box_content .upgrade-autosubmit', function(event){
//   event.preventDefault();

//   let e = jQuery(event.target);
//   let form = e.parents('form');
//   let page = form.find('[name=page]').val();

//   if (page) {
//     jQuery.ajax({
//       type: 'GET',
//       url: form.attr('action'),
//       data: form.serialize(),
//       success: function(data) {
//         e.parents('.box_content').html(data);
//       }
//     })
//   }
// });


/* handle ratings */

jQuery(document).on('click', '.pm-ratings img', function(event) {
  event.preventDefault()

  var pid = jQuery(event.currentTarget).attr('data-pid');
  var rating = jQuery(event.currentTarget).attr('data-quality');
  var container = jQuery(event.currentTarget).closest('.pm-ratings');
  var rated = container.hasClass('pm-rated');

  if (rated) {return true;}

  // console.log(pid, rating, rated);
  // return 6

  jQuery.ajax({
    url: '/' + Upgrade.current_locale() + '/image/' + pid + '/vote',
    data: {rating: rating},
    success: function(html) {
      container.html(html)
    }
  })
})


// keyword admin

class PmKeywordAdmin {
  constructor() {
    jQuery(document).on('click', '.pm-keyword', (event) => {
      var element = jQuery(event.currentTarget)
      element.toggleClass('selected')
      this.updateOptions()
    })

    jQuery(document).on('click', '.pm-keyword a', (event) => {
      event.stopPropagation()
    })

    jQuery(document).on('click', '.pm-deselect-keywords', (event) => {
      event.preventDefault()
      this.selected().removeClass('selected')
      this.updateOptions()
    })

    jQuery(document).on('change', '.pm-merge-control select', (event) => {
      this.submit()
    })

    jQuery(document).on('change', '.pm-show-controls', (event) => {
      var val = jQuery(event.currentTarget).prop('checked')
      if (val) {
        jQuery('.keyword-list').addClass('pm-controls')
      } else {
        jQuery('.keyword-list').removeClass('pm-controls')
      }
    })
  }

  selected() {
    return jQuery('.keyword-list .pm-keyword.selected')
  }

  anySelected() {
    return this.selected().length > 0
  }

  mergeControl() {
    return jQuery('.pm-merge-control')
  }

  mergeSelect() {
    return this.mergeControl().find('select')
  }

  mergeForm() {
    return this.mergeSelect().parents('form')
  }

  updateOptions() {
    this.mergeSelect().empty()

    if (this.anySelected()) {
      this.mergeControl().show()
      this.mergeSelect().append('<option selected>')
      for (var e of this.selected()) {
        var o = document.createElement('option')
        o.innerHTML = e.getAttribute('data-title');
        o.setAttribute('value', e.getAttribute('data-id'))
        this.mergeSelect().append(o)
      }
    } else {
      this.mergeControl().hide()
    }
  }

  submit() {
    var target_id = this.mergeSelect().val()
    var url = '/' + Upgrade.current_locale() + '/keywords/' + target_id + '/merge'
    var other_ids = []
    for (var e of this.selected()) {
      other_ids.push(e.getAttribute('data-id'))
    }
    // console.log(target_id, url, other_ids.join(','))
    this.mergeForm().attr('action', url)
    this.mergeForm().find('input[name=other_ids]').val(other_ids.join(','))
    this.mergeForm().submit()
  }
}

var keyword_admin = new PmKeywordAdmin()


/* hide/unhide user database quota */
jQuery(document).ready(function(){
  Upgrade.displaySourceQuota(jQuery("#source_kind"))
  jQuery("#source_kind").change(function(){
    Upgrade.displaySourceQuota(jQuery(this))
  });

  const boxes = new Boxes('#boxes')
  boxes.init()
});


/* swap en/de keyword titles in keyword form */
jQuery(document).ready(function(event) {
  jQuery('a.pm-swap-keyword-titles').on('click', function(event) {
    console.log('bal')
    event.preventDefault()

    const en_input = jQuery('#keyword_title')
    const de_input = jQuery('#keyword_title_de')

    const tmp = en_input.val()
    en_input.val(de_input.val())
    de_input.val(tmp)
  });
});

/* restore store-in-collection button state on browser back navigation */
jQuery(document).ready(function(){
  var checked_images = jQuery('input[type=checkbox]:checked')
  if (checked_images.length) {
    jQuery('.store_controls .popup_toggle').removeClass(['disable', 'disabled'])
  }
})


// toggle display of all artists (instead of only the first 2)
function toggleAllArtists(event) {
  event.preventDefault()

  var a = event.currentTarget
  var labels = a.querySelectorAll('span')
  for (var label of labels) {
    label.classList.toggle('d-none')
  }

  var nodes = a.parentElement.querySelectorAll('.artist')
  artists = Array.from(nodes).slice(2)
  for (var artist of artists) {
    artist.classList.toggle('d-none')
  }
}