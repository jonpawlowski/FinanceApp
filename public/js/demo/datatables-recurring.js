var myEditor; // use a global for the submit and return data rendering in the examples
// All charges table shown on the /charges page
$(document).ready(function() {
    myEditor = new $.fn.dataTable.Editor( {
      table: '#recurringChargesTable',
      idSrc: 'vendor',
      fields: [ {
              label: "Date:",
              name: "date"
          }, {
              label: "Vendor:",
              name: "vendor"
          }, {
              label: "Amount:",
              name: "amount"
          }, {
              label: "Payment Type:",
              name: "payment_type",
          }, {
              label: "Comments:",
              name: "comments"
          }
      ]
    } );

 // Recent charges table shown on the home page
    $('#recurringChargesTable').DataTable( {
      order: [[ 0, 'desc' ], [ 1, 'asc' ]],
      lengthMenu: [[10, 20, -1], [10, 20, "All"]],
      dom: '<"row"<"col-sm-3"l><"col-sm-6"><"col-sm-3"f>>' +
      '<"row"<"col-sm-12"tr>>' +
      '<"row"<"col-sm-5"i><"col-sm-7"p>>' +
      '<"row"<"col-sm-12"B>>',
      columns: [
        { data: "date" },
        { data: "vendor" },
        { data: "amount" },
        { data: "payment_type" },
        { data: "comments" }
      ],
      select: true,
      buttons: [
        {

            text: 'Submit',
            className: 'btn btn-primary',
            action: function ( e, dt, node, config ) {
              // Submit the form on the page
              document.getElementById('recurringChargesForm').submit();
            }
        },
        {
          extend: 'remove',
          text: 'Delete Charge',
          className: 'btn btn-primary',
          editor: myEditor,
          formMessage: function ( e, dt ) {
            var rows = dt.rows( e.modifier() ).data().pluck('vendor');
            var vendorHTML = rows.join("" );
            var valueIndex = vendorHTML.lastIndexOf("value=");
            var vendorString = vendorHTML.substring((valueIndex + 7), (vendorHTML.length -2 ));
            return 'Are you sure you want to delete the entry for the '+
                'following record? <ul><li>'+ vendorString + '</li></ul>';
          }
        }
      ]
    } );

} );
