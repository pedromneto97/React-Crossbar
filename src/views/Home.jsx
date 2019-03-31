import React, {Component} from 'react';
import {Alert, Button, Form} from 'react-bootstrap';
import logo from '../logo.svg';
import '../assets/css/App.css';
import {Connection} from 'autobahn';

class Home extends Component {
    constructor(props) {
        let wsuri;
        if (document.location.hostname === 'localhost') {
            wsuri = {
                transports: [
                    {
                        'type': 'websocket',
                        'url': 'ws:' + '//' + 'crossbar-stepper.herokuapp.com' + '/ws'
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
            velocidade_anterior: 0,
            passos: 0,
            passos_anterior: 0,
            passos_total: 0,
            atualizacao: true,
            validated: false,
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
                        velocidade_anterior: this.state.velocidade,
                        velocidade: parseInt(msg[0]),
                        atualizacao: true
                    }
                );
            }.bind(this));

            session.subscribe('io.passos', function (msg) {
                this.setState({
                        passos_anterior: this.state.passos,
                        passos: parseInt(msg),
                        passos_total: this.state.passos_total + parseInt(msg[0]),
                        atualizacao: true
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
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            return;
        }
        this.setState({validated: true});
        if (this.state.connection.session) {
            if (this.state.velocidade !== this.state.velocidade_anterior) {
                this.state.connection.session.publish('io.velocidade', [this.state.velocidade]);
                this.setState({velocidade_anterior: this.state.velocidade});
            }
            if (this.state.passos !== this.state.passos_anterior) {
                this.state.connection.session.publish('io.passos', [this.state.passos]);
                this.setState({
                    passos_anterior: this.state.passos,
                    passos_total: this.state.passos_total + this.state.passos
                });
            }
        } else {
            console.error('Sessão não existente');
        }
    }

    handleReset(event) {
        this.setState({
            velocidade_anterior: this.state.velocidade,
            passos_anterior: this.state.passos,
            passos: 0,
            velocidade: 0,
            atualizacao: false
        });
        this.state.connection.session.publish('io.velocidade', [this.state.velocidade]);
        this.state.connection.session.publish('io.passos', [this.state.velocidade]);
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
                            <Form.Control type='range' min={0} max={1000} value={this.state.velocidade}
                                          name='velocidade' onChange={this.handleChange}/>
                            <Form.Text className="text-muted">
                                Controla a velocidade do motor
                            </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="passos">
                            <Form.Label>
                                Passos: {this.state.passos}
                            </Form.Label>
                            <Form.Control type='number' onChange={this.handleChange} name='passos'
                                          value={this.state.passos}/>
                            <Form.Control.Feedback type='invalid'>Necessita ser um número</Form.Control.Feedback>
                            <Form.Text className="text-muted">
                                Número de passos do motor
                            </Form.Text>
                        </Form.Group>
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
