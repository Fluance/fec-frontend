const NavButtonVisitList = {
    bindings: {
        pid: '<',
        isEnabled: '<?'
    },
    template: '<fec-nav-button text="{{\'visit.TITLE_LIST\' | translate}}" state="visitList" state-params="{pid:$ctrl.pid}" is-enabled="$ctrl.isEnabled" />'
};

export default NavButtonVisitList;
