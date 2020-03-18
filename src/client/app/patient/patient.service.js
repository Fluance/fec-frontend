function patientService() {
    var service;

    service = {
        // Constants
        GENDER_MALE: 'm',
        GENDER_FEMALE: 'f',
        GENDER_UNKNOWN: 'u',

        // API
        getGenderType: getGenderType
    };

    return service;

    // -----------------------------------------------------

    function getGenderType(genderDescription) {
        genderDescription = _.lowerCase(genderDescription);

        switch(genderDescription) {
            case 'f': return service.GENDER_FEMALE;
            case 'm': return service.GENDER_MALE;
            default: return service.GENDER_UNKNOWN;
        }
    }
}

export default patientService;
