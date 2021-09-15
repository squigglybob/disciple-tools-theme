jQuery(document).ready(function() {
  if ('metrics' === window.wpApiShare.url_path || 'metrics/' === window.wpApiShare.url_path || window.wpApiShare.url_path.startsWith( 'metrics/personal/activity-log' ) ) {
    console.log('hi there')
    my_stats()
  }

  function my_stats() {
    "use strict";
    let chartDiv = jQuery('#chart')
    let sourceData = dtMetricsPersonal.data
    let translations = dtMetricsPersonal.data.translations

    jQuery('#metrics-sidemenu').foundation('down', jQuery('#personal-menu'));

    /* activity */
    const user_id = sourceData.user_id

    makeRequest( "get", `activity-log`, null , 'user-management/v1/')
    .done(activity=>{

      const title = makeTitle(window.lodash.escape( translations.title ))
      const activity_html = window.SHAREDFUNCTIONS.makeActivityList(activity)

      let html = `
        ${title}
        <div className="activity">
          ${activity_html}
        </div>
      `
      chartDiv.empty().html( html )
    }).catch((e)=>{
      console.log( 'error in activity')
      console.log( e)
    })
  }
})

function makeTitle(title) {
  return `
    <div class="cell center">
      <h3>${ title }</h3>
    </div>
  `
}
