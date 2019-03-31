import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {Col, Container, Row} from 'react-bootstrap';
import './assets/css/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './views/Home';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<Container fluid={true}>
        <Row>
            <Col>
                <BrowserRouter>
                    <Switch>
                        <Route path="/" exact={true} component={Home}/>
                    </Switch>
                </BrowserRouter>
            </Col>
        </Row>
    </Container>
    , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
