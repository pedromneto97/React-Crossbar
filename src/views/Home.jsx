import React, {Component} from 'react';
import {Alert, Button, Form} from 'react-bootstrap';
import logo from '../logo.svg';
import '../assets/css/App.css';
import {Connection} from 'autobahn';

function InputMov(props) {
    const {
        handleChange,
        value,
        name,
        descricao
    } = props;
    return (<Form.Group controlId={name}>
        <Form.Control type='number' onChange={handleChange} name={name}
                      value={value}/>
        <Form.Control.Feedback type='invalid'>Necessita ser um número</Form.Control.Feedback>
        <Form.Text className="text-muted">{descricao}</Form.Text>
    </Form.Group>);
}

class Home extends Component {
    constructor(props) {
        let wsuri;
        if (document.location.hostname === 'localhost') {
            wsuri = {
                transports: [
                    {
                        'type': 'websocket',
                        'url': 'ws://crossbar-stepper.herokuapp.com/ws'
                    }
                ], realm: 'realm1'
            }
        } else {
            wsuri = {
                url: (document.location.protocol === 'http:' ? 'ws:' : 'wss:') + '//' + document.location.host + '/ws',
                realm: 'realm1'
            };
        }
        super(props);
        this.state = {
            velocidade: 0,
            passos: 0,
            distancia: 0,
            atualizacao: false,
            validated: false,
            tipo_passos: true,
            connection: new Connection(wsuri),
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleAlert = this.handleAlert.bind(this);
        this.state.connection.onopen = function (session, details) {
            console.info('Aberto!');
            session.subscribe('io.velocidade', function (msg) {
                this.setState({
                        velocidade: parseInt(msg[0]),
                        atualizacao: true
                    }
                );
            }.bind(this));

            session.subscribe('io.passos', function (msg) {
                this.setState({
                        passos: parseInt(msg),
                    atualizacao: true,
                    tipo_passo: true
                    }
                );
            }.bind(this));

            session.subscribe('io.distancia', function (msg) {
                this.setState({
                        distancia: parseInt(msg),
                        atualizacao: true,
                        tipo_passo: true
                    }
                );
            }.bind(this));
        }.bind(this);
        this.state.connection.open();
    }

    handleChange(event) {
        if (event.target.name === 'velocidade')
            this.setState({'velocidade': parseInt(event.target.value)});
        else if (event.target.name === 'passos')
            this.setState({'passos': parseInt(event.target.value)});
        else if (event.target.name === 'distancia')
            this.setState({distancia: parseInt(event.target.value)});
        else if (event.target.name === 'type.select')
            if (event.target.value === 'milimetros') {
                this.setState({
                    passos: 0,
                    tipo_passo: false
                })
            } else if (event.target.value === 'passos') {
                this.setState({
                    distancia: 0,
                    tipo_passo: true
                })
            }
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }
        this.setState({validated: true});
        if (this.state.connection.session) {
            if (this.state.velocidade !== 0) {
                this.state.connection.session.publish('io.velocidade', [this.state.velocidade]);
            }
            if (this.state.passos > 0) {
                this.state.connection.session.publish('io.passos', [this.state.passos]);
            }
            if (this.state.distancia > 0) {
                this.state.connection.session.publish('io.distancia', [this.state.distancia]);
            }
        } else {
            console.error('Sessão não existente');
        }
    }

    handleReset(event) {
        this.setState({
            passos: 0,
            distancia: 0,
            velocidade: 0,
            tipo_form: true,
            atualizacao: false
        });
        this.state.connection.session.publish('io.velocidade', [0]);
        this.state.connection.session.publish('io.passos', [0]);
        this.state.connection.session.publish('io.passos', [0]);
    }

    handleAlert(event) {
        this.setState({
            atualizacao: false
        });
    }


    render() {
        const {validated} = this.state;
        return (
            <div className="App">
                <header className="App-header mt-3">
                    <Alert dismissible variant="info" show={this.state.atualizacao}
                           onClose={this.handleAlert}>
                        <Alert.Heading>Houve uma alteração em um dos componentes!</Alert.Heading>
                    </Alert>
                    <img src={logo} className="App-logo" alt='Logo'/>
                    {this.state.texto}
                    <Form onSubmit={this.handleSubmit} noValidate
                          validated={validated}>
                        <Form.Group controlId="velocidade">
                            <Form.Label>
                                Velocidade: {this.state.velocidade}
                            </Form.Label>
                            <Form.Control type='range' min={0} max={5000} value={this.state.velocidade}
                                          name='velocidade' onChange={this.handleChange}/>
                            <Form.Text className="text-muted">
                                Controla a velocidade do motor
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="type.select">
                            <Form.Label>Selecione o tipo de movimentação</Form.Label>
                            <Form.Control as="select" name="type.select" onChange={this.handleChange}>
                                <option value='passos'>Passos</option>
                                <option value='milimetros'>Milímetros</option>
                            </Form.Control>
                        </Form.Group>
                        {this.state.tipo_passo ?
                            <InputMov handleChange={this.handleChange} value={this.state.passos} name='passos'
                                      descricao="Número de passos do motor"/> :
                            <InputMov handleChange={this.handleChange} value={this.state.distancia} name="distancia"
                                      descricao="Distância em milímetros"/>
                        }

                        <Form.Group>
                            <Form.Control type='reset' onClick={this.handleReset}/>
                        </Form.Group>
                        <Button type='submit' variant='info'>Submit</Button>
                    </Form>
                </header>
            </div>
        );
    }
}

export default Home;
