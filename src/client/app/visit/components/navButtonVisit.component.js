const NavButtonVisit = {
    bindings: {
        vnb: '<',
        isEnabled: '<?'
    },
    template: '<fec-nav-button text="{{\'visit.TITLE\' | translate}}" state="visit" state-params="{vnb:$ctrl.vnb}" is-enabled="$ctrl.isEnabled" />'
};

export default NavButtonVisit;
