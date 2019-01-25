// Call the dataTables jQuery plugin
$(document).ready(function() {
  $('#allChargesTable').DataTable( {
    "columnDefs": [
      { "type": "date", "targets": 0 }
    ],
    "order": [[ 0, "desc" ]],
    "lengthMenu": [[50, 75, 100, -1], [50, 75, 100, "All"]],
    "pageLength": 50
  });

  // Recent Charges Table
  $('#recentChargesTable').DataTable( {
    "order": [[ 0, "desc" ]],
    "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
    select: {
          style: 'single'
        }
  } );

} );
