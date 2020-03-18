CompanySelectionController.$inject = [
    '$mdDialog',
    'dataservice.companies',
    'sessionService',
    '$rootScope'
];

function CompanySelectionController($mdDialog, dataServiceCompanies, session, $rootScope) {
    var vm = this;
    vm.companies = (session.user) ? session.user.companies : [];
    vm.selectCompany = selectCompany;
    vm.selectedCompanyId = vm.selectedCompany.id;
    vm.cancel = cancel;
    vm.ok = ok;

    return vm;

    // --------------------------------------------------------------- Interface implementation

    function selectCompany(selectedCompany) {
        dataServiceCompanies
            .getCompanyDetail(selectedCompany.id)
            .then(function(company) {
                vm.selectedCompany = company;
                vm.selectedCompanyId = company.id;
                session.user.companyId = company.id;
            });
    }

    function cancel() {
        $mdDialog.cancel();
    }

    function ok() {
        $rootScope.$emit(session.EVENT_SELECTED_COMPANY_CHANGED);
        $mdDialog.hide(vm.selectedCompany);
    }
}

export default CompanySelectionController;
