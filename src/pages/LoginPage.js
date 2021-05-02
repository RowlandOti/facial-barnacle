import '../App.css';
import React, {useState} from 'react'
import useStateWithRef from 'react-usestateref'
import {useToasts} from 'react-toast-notifications'
import {userService} from '../services/UserService'
import {storageRef} from '../init-fcm'
import LinearProgress from '@material-ui/core/LinearProgress';
import MSLogo from '../assets/facial-login.png'
import BgImage from '../assets/background.svg'
import BackArrow from '../assets/arrow-left.svg'
import PortraitPhoto from '../assets/take-photo.svg'
import Webcam from 'react-webcam'
import MarchingAnts from '../assets/marching-ants.gif'
import {animated, useTransition} from 'react-spring'

function LoginPage({clientToken}) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (message) => {
            let state = message.data['firebase-messaging-msg-data'].data.authorized
            setCurrentStep(7)
            setApprovalState(state === 'true')
        });
    }

    const webcamRef = React.createRef()
    const emailFieldRef = React.createRef()

    const [email, setEmail] = useState('')
    const [photoBase64, setPhotoBase64, photoBase64Ref] = useStateWithRef('')
    const [photoDownloadUrl, setPhotoDownloadUrl, photoDownloadUrlRef] = useStateWithRef('')
    const [uploading, setUploading, uploadingRef] = useStateWithRef(false);
    const [uploadProgress, setUploadProgress, uploadProgressRef] = useStateWithRef(0);
    const [currentStep, setCurrentStep] = useState(0)
    const [approvalState, setApprovalState] = useState(false)
    const [isForwardAnim, setIsForwardAnim] = useState(false)

    const videoConstraints = {
        width: 352,
        height: 400,
        facingMode: 'user'
    }

    const {addToast} = useToasts()

    const capturePhoto = () => {
        const photoBase64 = webcamRef.current.getScreenshot({width: 704, height: 800})
        setPhotoBase64(photoBase64)
        uploadPhoto()
    }

    function guidGenerator() {
        const S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4());
    }

    function resetLoadingState() {
        setUploadProgress(0)
        setUploading(false)
    }

    const uploadPhoto = () => {
        setUploading(true)
        const uploadTask = storageRef.ref(`/images/${email}/${guidGenerator()}`)
            .putString(photoBase64Ref.current.split(',')[1], 'base64', {contentType: 'image/jpg'})
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                setUploadProgress(progress)
            },
            (error) => {
                console.log("error:-", error)
                addToast("Photo Upload Fail", {
                    appearance: 'error',
                    autoDismiss: true,
                })
                resetLoadingState()
            },
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    console.log('File available at', downloadURL);
                    addToast("Photo Upload Success", {
                        appearance: 'success',
                        autoDismiss: true,
                    })
                    setPhotoDownloadUrl(downloadURL)
                    resetLoadingState()
                    goNext()
                });
            }
        );
    }

    const performLogin = () => {
        const payload = {
            email: email,
            photoDownloadUrl: photoDownloadUrl,
            clientToken: clientToken
        }
        userService.loginUser(payload)
            .then(response => {
                console.log("Login Res ==== : ", response);
                if (response.status === 200) {
                    goNext()
                } else {
                    console.log('Something went wrong and we dont know ==', response)
                    addToast("Something went wrong and we don't know", {
                        appearance: 'error',
                        autoDismiss: true,
                    })
                }
            }).catch(error => {
                if (error.response.status === 401) {
                    console.log('Login Unauthorized ==', error)
                    addToast("Unauthorised : User unknown", {
                        appearance: 'error',
                        autoDismiss: true,
                    })
                } else {
                    console.log("Login Error: ====", error);
                    addToast("Error occurred on login", {
                        appearance: 'error',
                        autoDismiss: true,
                    })
                }
            }
        )
    }

    const updateEmail = (event) => {
        setEmail(emailFieldRef.current.value)
        goNext()
    }

    const goNext = () => {
        setIsForwardAnim(true)
        if (currentStep === 6) {
            setTimeout(function () {
                goNext()
            }, 5000)
        }
        if (currentStep === 7) return
        else setCurrentStep(currentStep + 1)
    }

    const goBack = () => {
        setIsForwardAnim(false)
        if (currentStep === 0) return
        else setCurrentStep(currentStep - 1)
    }

    const passwordIcon = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAAA9UlEQVRIie2V4W3CMBSEPyr+wwhsQJggvg0YoRvACIzQEToCTPBgA0agG7BBKkuHZIhF/ySVqHpSZPvsd+f4PdmTrusYE2+jqv+GwSSlNOoZTd2egOPA2globwbHiNgNqS4p67Wvn+TXN5jWSEnJVXAFPiPiKmkBvHtJ5i6S5ubmLpReJfYMLLQHZqbyeGtuaW4NNECulI25raQmG5d6tSNaFOJYiEK87DcFN3PsHWoGZ+CrGO/dHgru8DCHY84/GuTz9s4ErCLiw/zanNzHcyvzjWPvUE2yF/YSVktiRPR2/fQPhsbfeQ9Gv65bf4Pj/9F/DuAbVoZQOfjl+HcAAAAASUVORK5CYII='
    const smartCardIcon = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAABSUlEQVRIDbWVgVHDMAxFBdcB2ARGqCZINiBskA3SbBA2KBvQCT6dgLIBG5QNwn1OAuOzOdcJuvPZcZz/bEmRr+Z5FjdV/XkotzcR2QL4SH2RAhxF5KVQfrA+C0kBRgC7EvXoxEnIdeFO/7JHE7/lyVX1Zm0Ad7zNQdYAiLklCVkDMFgsziYu1vccbBaKjzmoDxYBctmmqlnAA4D9EmhsvwAUV9VWRO5s6gTgeRWAqlJ0HwTK55kZHYBTDSDMIhc/UNfaweaq3baxXbYuDqAN3jOf6aKGa2rc5Sdwn0+JNVO0pgrwb+YAD2CfAPXRmovsKwb0rWVLYz6fAvGGNaY2XcP/oBORVxNsonVdrQu/YxDk+dFqzGhjqf0HJBNkXpfv1kqvzqylit1Q+G01gPZk/b1PqCovFLZFAArvANA9FGU59pJM8ctOJyKfiBh/XkPI7UsAAAAASUVORK5CYII='
    const tokenIcon = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAABM0lEQVRIDe1V0U3DQAx9QR0AJqBskA2SN0G7AbBBOgEdoRsQNggTuGxQNigbhAmCLN5J6eVEI5QggfCPc87de/azdZd1XYc57WJW9J8gyMqynFWjhfwLgP3E2CWAIhDszWw7JTpJxyt+f5MXqSDJCsAaQG1mNck7rS8BHAFUZtZKBte6BdD43rMEJB3gWsvQ+Ef5d9dVRE74AOBN+1d+1sxOhiUlkWfzGsU2AK4ALLVeyd8AyEUCEZ/YgMDM/EATxXYuiUuj0LO8y3NQBRsza2K80U0mWfckqRJbKpL5twhIema3yjw3s6Mq8yFw2e5VxYA4OUUR+LKnuWvckPRvn6Cd5Fzr/+A2OEvQayw0QcFaEQbZnkaNKT5L3yrDYNkI8qT9nfdg9uu6iBo4mf0/+l8bgA/2U2G6PTxJhAAAAABJRU5ErkJggg=='

    const FirstView = () => {
        return (
            <div className='page-content'>
                <h1 className='title'>Sign in</h1>
                <input ref={emailFieldRef} name='email' type='email' placeholder='Email or phone'
                       className='ms-text-box form-control'/>
                <button className='sub-text-link-btn'>Can't access your account?</button>
                <p className='sub-text hidden'>yo</p>
                <div className='button-bar' onClick={updateEmail}>
                    <button className='button primary'>Next</button>
                </div>
            </div>
        )
    }

    const SecondView = () => {
        return (
            <div className='page-content'>
                <p className='email-header'>
                    <a className='back-arrow' onClick={goBack}><img src={BackArrow} className='back-arrow-icon'
                                                                    alt='back'/></a>
                    <span>{email}</span>
                </p>
                <h2 className='sub-title'>Authentication options</h2>
                <button className='authentication-option' onClick={goNext}>
                    <img src={`data:image/jpeg;base64,${passwordIcon}`} className='auth-option-icon'
                         alt='password'/>
                    <span className='auth-option-label'>Password</span>
                </button>
                <button className='authentication-option'>
                    <img src={`data:image/jpeg;base64,${smartCardIcon}`} className='auth-option-icon'
                         alt='smart or pin'/>
                    <span className='auth-option-label'>Sign in with PIN or smartcard</span>
                </button>
            </div>
        )
    }

    const ThirdView = () => {
        return (
            <div className='page-content'>
                <p className='email-header'>
                    <a className='back-arrow' onClick={goBack}><img src={BackArrow} className='back-arrow-icon'
                                                                    alt='back'/></a>
                    <span>{email}</span>
                </p>
                <h1 className='title'>Enter password</h1>
                <input name='password' type='password' placeholder='Password' className='ms-text-box form-control'/>
                <button className='sub-text-link-btn'>Forgot my password</button>
                <p className='sub-text hidden'>yo</p>
                <div className='button-bar'>
                    <button className='button primary' onClick={goNext}>Next</button>
                </div>
            </div>
        )
    }

    const FourthView = () => {
        return (
            <div className='page-content'>
                <p className='header-label'>For security reasons, we require additional information to verify your
                    account</p>
                <p className='email-header'>
                    <a className='back-arrow' onClick={goBack}><img src={BackArrow} className='back-arrow-icon'
                                                                    alt='back'/></a>
                    <span>{email}</span>
                </p>
                <h2 className='sub-title'>Authentication options</h2>
                <button className='authentication-option'>
                    <img src={`data:image/jpeg;base64,${smartCardIcon}`} className='auth-option-icon'
                         alt='password'/>
                    <span className='auth-option-label'>Sign in with PIN or smartcard</span>
                </button>
                <button className='authentication-option'>
                    <img src={`data:image/jpeg;base64,${tokenIcon}`} className='auth-option-icon'
                         alt='smart or pin'/>
                    <span className='auth-option-label'>Sign in with your phone or token device</span>
                </button>
                <button className='authentication-option' onClick={goNext}>
                    <img src={PortraitPhoto} className='auth-option-icon' alt='smart or pin'/>
                    <span className='auth-option-label'>Take a photo</span>
                </button>
            </div>
        )
    }

    const FifthView = () => {
        return (
            <div className='page-content'>
                <p className='header-label'>Please ensure you are clearly visible within the camera frame.</p>
                <p className='email-header'>
                    <a className='back-arrow' onClick={goBack}><img src={BackArrow} className='back-arrow-icon'
                                                                    alt='back'/></a>
                    <span>{email}</span>
                </p>
                <h2 className='sub-title'>Smile for the camera</h2>
                <Webcam
                    audio={false}
                    height={400}
                    ref={webcamRef}
                    screenshotFormat='image/jpeg'
                    width={352}
                    videoConstraints={videoConstraints}/>
                <div className='button-bar' style={{marginTop: 20}}>
                    {uploadingRef.current && <LinearProgress variant="determinate" value={uploadProgressRef.current}/>}
                </div>
                <div className='button-bar' style={{marginTop: 20}}>
                    <button className='button primary' onClick={capturePhoto}>Capture photo</button>
                </div>
            </div>
        )
    }

    const SixthView = () => {
        return (
            <div className='page-content'>
                <p className='email-header'>
                    <a className='back-arrow' onClick={goBack}><img src={BackArrow} className='back-arrow-icon'
                                                                    alt='back'/></a>
                    <span>{email}</span>
                </p>
                <h2 className='sub-title'>Confirm photo</h2>
                <img src={photoBase64 != null ? photoBase64 : photoDownloadUrl} className='captured-image' alt='back'/>
                <div className='button-bar' style={{marginTop: 20}}>
                    <button className='button primary' onClick={performLogin}>Request access</button>
                </div>
            </div>
        )
    }

    const SeventhView = () => {
        return (
            <div className='page-content'>
                <p className='header-label'>Awaiting confirmation from the authorized approver for your account.</p>
                <p className='email-header'>
                    <span>{email}</span>
                </p>
                <h2 className='sub-title'>Waiting for response</h2>
                <img src={MarchingAnts} className='marchingAnts' alt='marching ants'/>
            </div>
        )
    }

    const EighthView = () => {
        return (
            <div className='page-content'>
                <p className='header-label'>Response received.</p>
                <p className='email-header'>
                    <span>{email}</span>
                </p>
                <h2 className='sub-title' style={{color: approvalState ? '#7FBA00' : '#cd0000'}}>Request for access
                    has been {approvalState ? 'approved' : 'rejected'}</h2>
            </div>
        )
    }

    const transitions = useTransition(currentStep, null, {
        from: {
            opacity: 0,
            transform: isForwardAnim ? `translate(300px, 0px)` : `translate(-300px, 0px)`,
            position: 'absolute'
        },
        enter: {opacity: 1, transform: `translate(0px, 0px)`, position: 'relative'},
        leave: {
            opacity: 0,
            transform: isForwardAnim ? `translate(-300px, 0px)` : `translate(300px, 0px)`,
            position: 'absolute'
        },
    })

    const ViewGenerator = ({item}) => {
        switch (item) {
            case 0:
                return <FirstView/>
            case 1:
                return <SecondView/>
            case 2:
                return <ThirdView/>
            case 3:
                return <FourthView/>
            case 4:
                return <FifthView/>
            case 5:
                return <SixthView/>
            case 6:
                return <SeventhView/>
            case 7:
                return <EighthView/>
            default:
                return <FirstView/>
        }
    }

    return (
        <div style={{backgroundImage: `url(${BgImage})`}} className='signin-page'>
            <div className='middle'>
                <div className='signin-box' key={currentStep}>
                    <img src={MSLogo} className='microsoftLogo' alt='microsoft'/>
                    {transitions.map(({item, key, props}) => (
                        <animated.div key={key} style={props}>
                            <ViewGenerator item={currentStep}/>
                        </animated.div>
                    ))}
                </div>
            </div>
            <footer id='footer'>
                <div id='footerLinks' className='floatReverse'>
                    <div><span id='copyright'>© 2021 Facial Barnacle</span><a id='helpDesk'
                                                                              className='pageLink footerLink'
                                                                              href='mailto:rowlandotienoo@gmail.com'>Help &amp; Support</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LoginPage;
