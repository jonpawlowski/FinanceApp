// Call the dataTables jQuery plugin
$(document).ready(function() {
  $.fn.dataTable.moment('MM/DD/YYYY');
  $('#recentChargesTables').DataTable(
    {
        "order": [[ 0, "desc" ]]
    }
  );
});
