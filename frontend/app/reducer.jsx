const initialUserState = {
    allVacancies: [],
    unviewedVacancies: [],
    boardVacancies: []
};

const reducer = function(state = initialUserState, action) {
    switch(action.type) {
        case 'ADD_VACANCY':
            switch(action.filter) {
                case 'all':
                    return Object.assign({}, state, { allVacancies: action.vacancy });
                case 'unviewed':
                    return Object.assign({}, state, { unviewedVacancies: action.vacancy });
                case 'board':
                    return Object.assign({}, state, { boardVacancies: action.vacancy });
                default: return state;
            }
        case 'CHANGE_VACANCY':
            let allVacancies = state.allVacancies,
                unviewedVacancies = state.unviewedVacancies,
                boardVacancies = state.boardVacancies;

            let el = allVacancies.filter((el) => el.vacancyId === action.vacancy.vacancyId)[0];
            if(allVacancies.indexOf(el) >= 0) {
                allVacancies[allVacancies.indexOf(el)] = action.vacancy;
            }

            el = unviewedVacancies.filter((el) => el.vacancyId === action.vacancy.vacancyId)[0];
            if(unviewedVacancies.indexOf(el) >= 0) {
                unviewedVacancies[unviewedVacancies.indexOf(el)] = action.vacancy;
            }

            el = boardVacancies.filter((el) => el.vacancyId === action.vacancy.vacancyId)[0];
            if(boardVacancies.indexOf(el) >= 0) {
                boardVacancies[boardVacancies.indexOf(el)] = action.vacancy;
            }

            return Object.assign({}, state, { allVacancies: allVacancies,
                unviewedVacancies: unviewedVacancies,
                boardVacancies: boardVacancies});
        default: return state;
    }
};

module.exports = reducer;
