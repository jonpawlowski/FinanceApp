// All charges table shown on the /charges page
$(document).ready(function() {
  $('#allChargesTable').DataTable( {
    "columnDefs": [
      { "type": "date", "targets": 0 }
    ],
    "order": [[ 0, "desc" ]],
    "lengthMenu": [[50, 75, 100, -1], [50, 75, 100, "All"]],
    "pageLength": 50
  });

// Recent charges table shown on the home page
  $('#recentChargesTable').DataTable( {
    order: [[ 1, 'desc' ], [ 2, 'asc' ]],
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
    dom: '<"row"<"col-sm-3"l><"col-sm-6"><"col-sm-3"f>>' +
    '<"row"<"col-sm-12"tr>>' +
    '<"row"<"col-sm-5"i><"col-sm-7"p>>' +
    '<"row"<"col-sm-12"B>>',
    select: {
            style: 'single'
        },
    "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            }
        ],
    buttons: [
      {
          extend: 'selected',
          text: 'Edit Charge',
          className: 'btn btn-info',
          action: function ( e, dt, node, config ) {
            const editID = this.row('.selected').data()[0];
            const editDateTable = this.row('.selected').data()[1];
            const editVendorTable = this.row('.selected').data()[2];
            var editAmountTable = this.row('.selected').data()[3];
            const editPaymentTypeTable = this.row('.selected').data()[4];
            const editCategoryTable = this.row('.selected').data()[5];
            const editCommentsTable = this.row('.selected').data()[6];

            // remove $ and convert to amount to number
            editAmountTable = editAmountTable.substring(1, editAmountTable.length);
            editAmountTable = parseFloat(editAmountTable);

            // convert date to proper format for html input type date YYYY-MM-DD
            var formatEditDateTable = editDateTable.substring(6) + '-' + editDateTable.substring(0,2) + '-' + editDateTable.substring(3,5);

            // assign the values from selected row to appropriate elements in the modal form
            document.getElementById('editFormId').value = editID;
            document.getElementById('editFormChargeDate').value = formatEditDateTable;
            document.getElementById('editFormVendor').value = editVendorTable;
            document.getElementById('editFormAmount').value = editAmountTable;
            document.getElementById('editFormPaymentType').value = editPaymentTypeTable;
            document.getElementById('editFormCategory').value = editCategoryTable;
            document.getElementById('editFormComments').value = editCommentsTable;

            //alert(' Date is ' + formatEditDateTable);
            $('#modalEditChargeForm').modal('show');
          }
      },
      {
          text: 'Enter Charge',
          className: 'btn btn-info',
          action: function ( e, dt, node, config ) {
            $('#modalNewChargeForm').modal('show');
          }
      }
    ]
  } );

} );
