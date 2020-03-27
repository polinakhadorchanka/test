let React = require('react');
let connect = require("react-redux").connect;
let actions = require("../actions.jsx");

class ParsersTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submitState: 'default',
            ipKey: '',
            ipToken: '',
            description: '',
            isValidKey: true,
            isValidToken: true,
            isValidDescription: true,
            errors: []
        };

        this.handleSubmitBtn = this.handleSubmitBtn.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onKeyChange = this.onKeyChange.bind(this);
        this.onTokenChange = this.onTokenChange.bind(this);
        this.onDescChange = this.onDescChange.bind(this);
        this.changeParser = this.changeParser.bind(this);
    }

    changeParser(parser, type) {
        switch(type) {
            case 'change':
                this.props.changeParser(parser);
                fetch(`/api/parsers`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(parser)
                    }).catch(function (err) {
                    console.log('EXP: ', err);
                });
                break;
            case 'delete':
                this.props.addParsers(this.props.store.parsers.filter((el) => el.ParserId !== parser.ParserId));

                fetch(`/api/parsers`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(parser)
                    }).catch(function (err) {
                    console.log('EXP: ', err);
                });
                break;

        }
    }

    onKeyChange(e) {
        let val = e.target.value;
        this.setState({isValidKey: true, ipKey : val, errors: []});
    }

    onTokenChange(e) {
        let val = e.target.value;
        this.setState({isValidToken: true, ipToken : val, errors: []});
    }

    onDescChange(e) {
        let val = e.target.value;
        this.setState({isValidDescription: true, description : val, errors: []});
    }

    handleSubmitBtn(e) {
        if(e.type === 'mouseover' || e.type === 'focus')
            this.setState({submitState : 'focus'});
        else this.setState({submitState : 'default'});
    }

    handleSubmit(e) {
        e.preventDefault();
        let key = this.state.ipKey,
            token = this.state.ipToken,
            description = this.state.description;

        if (key === '' || token === '' || description === '') {
            this.setState({
                isValidKey: key !== '',
                isValidToken: token !== '',
                isValidDescription: description !== ''
            });
        } else {
            let context = this,
                obj = {
                    ParserKey: this.state.ipKey,
                    ParserToken: this.state.ipToken,
                    ParserDescription: this.state.description,
                    ParserState: 0
                };

            fetch(`/api/parsers`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(obj)
                })
                .then(response => response.json()).then(function (data) {
                if (data[0] && data[0].errorCode !== 0) {
                    context.setState({errors: data});
                }
                else {
                    context.setState({
                        ipKey: '',
                        ipToken: '',
                        description: ''
                    });
                    document.getElementById('form').reset();
                    context.props.addParsers(context.props.store.parsers.concat(obj));
                }
            })
                .catch(function (err) {
                    console.log('EXP: ', err);
                });
        }
    }

    render() {
        let divStyle = {
                'color': '#e1e1e1',
                'padding': '0 10px',
                'min-width': '1000px'
            },
            tableStyle = {
                'width': '100%',
                'border': '1px solid #1e1e1e',
                'border-collapse': 'collapse'
            },
            trStyle = {
                'width': '25%',
                'height': '40px'
            },
            thStyle = {
                'padding-left': '10px',
                'padding-right': '10px',
                'background-color': '#b1b1b1',
                'color': '#1e1e1e'
            },
            tdStyle = {
                'padding-left': '10px',
                'padding-right': '10px',
                'background-color': '#383838',
                'border': '1px solid #1e1e1e'
            },
            inputTextStyle = {
                'width': '100%',
                'background-color': 'transparent',
                'border': 'none',
                'border-bottom': '1px solid #e1e1e1',
                'color': '#e1e1e1',
                'outline': 'none'
            },
            inputTextStyleError = {
                'width': '100%',
                'background-color': 'transparent',
                'border': 'none',
                'border-bottom': '1px solid #CF3F3B',
                'color': '#e1e1e1',
                'outline': 'none'
            },
            inputSubmitStyle = {
                'width': '100%',
                'background-color': 'transparent',
                'border': 'none',
                'color': '#e1e1e1',
                'cursor': 'pointer',
                'outline': 'none'
            },
            inputSubmitStyleFocus = {
                'width': '100%',
                'background-color': 'transparent',
                'border': 'none',
                'color': '#7f9fd5',
                'cursor': 'pointer',
                'outline': 'none'
            },
            pStyle = {
                'padding-left': '2px',
                'padding-right': '2px',
                'color': '#CF3F3B'
            };

        let context = this;
        return (
            <div style={divStyle}>
                <table style={tableStyle}>
                    <tr style={trStyle}>
                        <th style={thStyle} width='25%'>IP key</th>
                        <th style={thStyle} width='25%'>IP tocken</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle} width='100'/>
                        <th style={thStyle} width='42'/>
                    </tr>
                    {
                        this.props.store.parsers.map(function (parser) {
                            return <Parser parser={parser} changeParser = {context.changeParser} />
                        })
                    }
                </table>
                <form id='form' onSubmit={this.handleSubmit}>
                    <table style={tableStyle}>
                        <tr style={trStyle}>
                            <td style={tdStyle} width='25%'>
                                <input style={this.state.isValidKey === true ? inputTextStyle : inputTextStyleError}
                                       type='text' placeholder='IP key' name='ipKey' maxLength={12}
                                       onChange={this.onKeyChange}/>
                            </td>
                            <td style={tdStyle} width='25%'>
                                <input style={this.state.isValidToken === true ? inputTextStyle : inputTextStyleError}
                                       type='text' placeholder='IP token' name='ipTocken' maxLength={12}
                                       onChange={this.onTokenChange}/>
                            </td>
                            <td style={tdStyle}>
                                <input style={this.state.isValidDescription === true ? inputTextStyle : inputTextStyleError}
                                       type='text' placeholder='Description' name='comment' maxLength={300}
                                       onChange={this.onDescChange}/>
                            </td>
                            <td style={tdStyle} width='142'>
                                <input style={this.state.submitState === 'default' ?
                                    inputSubmitStyle : inputSubmitStyleFocus}
                                       onMouseOver={this.handleSubmitBtn} onMouseOut={this.handleSubmitBtn}
                                       onFocus={this.handleSubmitBtn} onBlur={this.handleSubmitBtn}
                                       type='submit' value='Add'/>
                            </td>
                        </tr>
                    </table>
                </form>
                {this.state.errors.map(function (error) {
                    return (<p style={pStyle}>{error.errorMessage}</p>);
                })}
            </div>
        );
    }
}

class Parser extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            descriptionState: 'text',
            description: props.parser.ParserDescription,
            isValidDesc: true
        };

        this.onHandleEditDesc = this.onHandleEditDesc.bind(this);
        this.changeState = this.changeState.bind(this);
        this.changeDesc = this.changeDesc.bind(this);
        this.confirmDeletion = this.confirmDeletion.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    changeState() {
        let parser = this.props.parser;
        parser.ParserState = parser.ParserState == 0 ? 1 : 0;
        this.props.changeParser(parser, 'change');
    }

    onHandleEditDesc(e) {
        if(e.type === 'click')
            this.setState({descriptionState : 'input'});
        else if(e.type === 'blur' && this.state.description === '')
            this.setState({descriptionState : 'input', isValidDesc : false});
        else {
            this.setState({descriptionState : 'text', isValidDesc : true});
            let parser = this.props.parser;
            parser.ParserDescription = this.state.description;
            this.props.changeParser(parser, 'change');
        }
    }

    changeDesc(e) {
        this.setState({description : e.target.value, isValidDesc : true});
    }

    async handleRemove(e) {
        let target = e.target;
        if(e.type === 'click') {
            e.target.classList.toggle('open');
            $(e.target).next().toggleClass('open');
            if(!$(e.target).hasClass('open'))
                e.target.blur();
        }
        else if(e.type === 'blur') {
            let elements = await document.querySelectorAll(':hover'),
                res = false;
            elements.forEach(function (el) {
                if(el.id === 'dropdown-content3') res = true;
            });
            if(!res) {
                $('.remove').removeClass('open');
                $('.remove').next().removeClass('open');
            }
        }
        e.stopPropagation();
    }

    confirmDeletion(e) {
        if(e.target.name === 'yes') {
            this.props.changeParser(this.props.parser, 'delete');
        }
        $('.dropdown-content').removeClass('open');
        $('.remove').removeClass('open');
        e.stopPropagation();
    }

    render() {
        let trStyle = {
                'width': '25%',
                'height': '40px'
            },
            tdStyle = {
                'padding-left': '10px',
                'padding-right': '10px',
                'background-color': '#383838',
                'border': '1px solid #1e1e1e'
            },
            inputTextStyle = {
                'width': '100%',
                'background-color': 'transparent',
                'border': 'none',
                'border-bottom': '1px solid #e1e1e1',
                'color': '#e1e1e1',
                'outline': 'none'
            },
            inputTextStyleError = {
                'width': '100%',
                'background-color': 'transparent',
                'border': 'none',
                'border-bottom': '1px solid #CF3F3B',
                'color': '#e1e1e1',
                'outline': 'none'
            };

        return (
            <tr style={trStyle}>
                <td style={tdStyle} width='25%'>{this.props.parser.ParserKey}</td>
                <td style={tdStyle} width='25%'>{this.props.parser.ParserToken}</td>
                <td style={tdStyle}>
                    {this.state.descriptionState === 'text' ?
                        <div title='Click to change' onClick={this.onHandleEditDesc}>{this.state.description}</div> :
                        <input autoFocus={true}
                               style={this.state.isValidDesc === true ? inputTextStyle : inputTextStyleError}
                               onBlur={this.onHandleEditDesc} onChange={this.changeDesc}
                               type='text' value={this.state.description} maxLength='300' />}
                </td>
                <td style={tdStyle} width='100'>
                    <label className="switch">
                        {this.props.parser.ParserState == 0 ?
                            <input type="checkbox" onChange={this.changeState}/> :
                            <input type="checkbox" checked onChange={this.changeState}/>}
                        <span className="slider"></span>
                    </label>
                </td>
                <td style={tdStyle} width='42'>
                    <div className="dropdown">
                        <button id='remove' title='Remove' className='remove' onBlur={this.handleRemove} onClick={this.handleRemove}/>
                        <div  id='dropdown-content3' className="dropdown-content"
                              onClick={(e) => e.stopPropagation()}>
                            <p>Are you sure?</p>
                            <div>
                                <input type='button' value='Yes' name='yes' onClick={this.confirmDeletion}/>
                                <input type='button' value='Cancel' name='cancel' onClick={this.confirmDeletion}/>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        );
    }
}

function mapStateToProps(state) {
    return {
        store: state
    };
}

const Connected = connect(mapStateToProps, actions) (ParsersTable);

class Export extends React.Component {
    render(){
        return (<Connected/>);
    }
}

export default Export;
