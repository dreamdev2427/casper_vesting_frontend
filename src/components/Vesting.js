import React, { useEffect, useState } from "react";
import { Divider, Grid, Typography, Box, Tab, Button, Slider, MenuItem, FormControl, Select, TextField, Avatar, InputAdornment } from "@mui/material";
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { duration, styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import {useSelector} from "react-redux";
import {NotificationManager} from "react-notifications";
import { useMediaQuery } from 'react-responsive';

// import ConnectWallet from "../Common/ConnetWallet";
import { dsUtilNumberWithCommas } from "../utilities";
import {VestingContractAddress } from "../config";

const PrettoSlider = styled(Slider)({
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
    '& .MuiSlider-valueLabel': {
        backgroundColor: '#fff',
        color: 'black'
    },
    '& 	.MuiSlider-markLabel': {
        color: '#fff',
    }
});

const Vesting = () => {

    const marks = [
        {
            value: 0,
            label: '0 ',
        },
        {
            value: 73,
            label: '73 ',
        },
        {
            value: 146,
            label: '146 ',
        },
        {
            value: 219,
            label: '219 ',
        },
        {
            value: 292,
            label: '292 ',
        },
        {
            value: 365,
            label: '365 ',
        },
    ];

	const account = useSelector(state => state.auth.currentWallet);
	const chainId = useSelector(state => state.auth.currentChainId);
	const globalWeb3 = useSelector(state => state.auth.globalWeb3);

    const isMobile = useMediaQuery({ query: '(max-width: 1224px)' });

    const [switchPanal, setSwitchPanal] = useState(true);
    const [APR, setAPR] = useState(0);
    const [totalVolumnVested, setTotalVolumnVested] = useState(0);
    const [myVested, setMyVested] = useState(0);
    const [myBalance, setMyBalance] = useState(0);
    const [miniVestingAmount, setMiniVestingAmount] = useState(0);
    const [VestingAmount, setVestingAmount] = useState(0);
    const [CDRprice, setCDRprice] = useState(0);
    const [claimingPeriod, setClaimingPeriod] = useState(28);
    const [VestingDuration, setVestingDuration] = useState(28+1);
    const [dailyReward, setDailyReward] = useState(0);
    const [unVestingAmount, setUnVestingAmount] = useState(0);
    const [pendingReward, setPendingRewards] = useState(0);

    const onClickMax = async () => {        
    }    
      
    const onClickStake = async () => {        
    }

    const onClickUnstake = async () => {       
    }

    const onClickClaim = async () => {       
    }

    return (
        <div style={{ width: '100%', display: 'flex', height:"95vh", flexDirection: 'column' }}>
            <Grid container justifyContent='center' style={{flex:1}} p={4}>
                <Grid item sm={12} md={10} lg={10} xl={10} style={{ border: '2px solid white',flex:1 }}>
                    <Grid container pt={2} alignItems='center' justifyContent='space-around'>
                        <Grid item sm={2} md={2} lg={2} xl={2}>
                            <Typography sx={{ color: 'white' }} variant="body1">APY</Typography>
                            <Typography sx={{ color: '#fa9422' }} variant="h6" fontWeight='bold'>{APR}%</Typography>
                        </Grid>
                        <Grid item sm={4} md={4} lg={4} xl={4}>
                            <Typography sx={{ color: 'white' }} variant="body1">Total Volume Locked</Typography>
                            <Typography sx={{ color: 'white' }} variant="h6" fontWeight='bold'>{totalVolumnVested} CDR</Typography>
                        </Grid>
                        <Grid item sm={4} md={4} lg={4} xl={4}>
                            <Typography sx={{ color: 'white' }} variant="body1">My Vested</Typography>
                            <Typography sx={{ color: 'white' }} variant="h6" fontWeight='bold'>{myVested} CDR</Typography>
                        </Grid>
                        <Grid item sm={12} md={12} lg={12} xl={12} mt={2}>
                            <Divider color="white" />
                        </Grid>
                        <Grid item sm={12} md={12} lg={12} xl={12} p={2}>
                            <Grid container>
                                <Box sx={{ width: '100%', typography: 'body1', padding: 2 }}>
                                    <Grid container alignItems='center' mb={2} py={2} justifyContent='space-around'>
                                        <Grid item xs={12} sm={5} md={5} lg={5} xl={5} px={2}>
                                            <Box py={1} px={2} sx={{ backgroundColor: '#fff', borderRadius: 60 }}>
                                                <Grid container alignItems='center' justifyContent='space-between'>
                                                    <Grid item xs={6} textAlign = "center" sx={{cursor:"pointer"}}>
                                                        <Typography width="100%" display='inline-block' px={0} py={1} sx={!switchPanal ? { color: '#000' } : { backgroundColor: '#055def', color: '#fff', borderRadius: 50 }} onClick={() => setSwitchPanal(true)}>Vest</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} textAlign = "center" sx={{cursor:"pointer"}}>
                                                        <Typography width="100%" display='inline-block' px={0} py={1} sx={switchPanal ? { color: '#000' } : { backgroundColor: '#055def', color: '#fff', borderRadius: 50 }} onClick={() => setSwitchPanal(false)}>Unvest</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    {switchPanal ? (
                                        <>
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Vesting Amount</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="right">Wallet balance: {myBalance} CDR</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='flex-end' >
                                                        <Grid item >
                                                            <TextField size="medium" type='number' variant="standard" defaultValue={"365.45"} 
                                                                sx={{ backgroundColor: 'transparent', input: { color: 'white', borderColor: 'white', fontSize: 24 }, width: 200 }} 
                                                                value={VestingAmount}
                                                                onChange={(e) => setVestingAmount(e.target.value)}
                                                                placeholder="0.00" 
                                                            />
                                                        </Grid>
                                                        <Grid item>
                                                            <Typography variant="body1" sx={{ color: 'white', display: 'inline', marginLeft: 2 }} align="left">(${Number(VestingAmount * CDRprice).toFixed(4) })</Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='center' justifyContent='right'>
                                                        <Grid item sm={6} md={3} lg={3} xl={3}>
                                                            <Button variant="contained" style={{ backgroundColor: '#e8f5fc' }}
                                                                onClick={() => onClickMax()}
                                                            >
                                                                <Typography color='#055ef0'>MAX</Typography>
                                                            </Button>
                                                        </Grid>                                                       
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid container alignItems='center' justifyContent='space-around' mt={2} spacing={2}>
                                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} align="left">Set Vesting Duration</Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={10} md={10} lg={10} xl={10}>
                                                    <PrettoSlider
                                                        aria-label="Always visible"
                                                        defaultValue={Number(claimingPeriod) + Number(1)}
                                                        getAriaValueText={(value) => {
                                                            return `${value} days`
                                                        }}
                                                        valueLabelFormat={(value) => {
                                                            return `${value} days`
                                                        }}
                                                        step={1}
                                                        color='primary'
                                                        max={365}
                                                        marks={marks.map((m) => {return {...m, label:isMobile? m.label :m.label+"days"}})}
                                                        valueLabelDisplay="on"
                                                        value={VestingDuration}
                                                        onChange={(e) => {setVestingDuration(e.target.value)}}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container alignItems='center' justifyContent='space-between' my={2}>
                                                <Grid item sm={6} md={6} lg={6} xl={6}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} align="left">Available amount</Typography>
                                                </Grid>
                                            </Grid>
                                            {/* <Grid container alignItems='center' mb={2} py={1} justifyContent='space-between' style={{ border: '2px solid white', borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="left">Daily:</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="right">{Number(dsUtilNumberWithCommas(dailyReward)).toFixed(4)} CDR (${Number(dailyReward * CDRprice).toFixed(4)})</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="left">Monthly:</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="right">{Number(dsUtilNumberWithCommas(dailyReward)*31).toFixed(4)} CDR (${Number(dailyReward*31 * CDRprice).toFixed(4)})</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="left">Yearly:</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="right">{Number(dsUtilNumberWithCommas(dailyReward)*365).toFixed(4)} CDR (${Number(dailyReward*365 * CDRprice).toFixed(4)})</Typography>
                                                </Grid>
                                            </Grid> */}
                                            <Button variant="contained" size="large" fullWidth
                                             onClick={() => {onClickStake()}}
                                            >Vest CDR</Button>
                                        </>
                                    ) : (<>
                                        <Grid container alignItems='center' mb={2} py={2} justifyContent='space-between' style={{ border: '2px solid white', borderRadius: 12 }}>
                                            <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                <Typography variant="h6" sx={{ color: 'white' }} lineHeight={2} align="left">CDR</Typography>
                                            </Grid>
                                            <Grid item sm={4} md={4} lg={4} xl={4} px={4}>
                                                <Typography variant="h6" sx={{ color: 'white' }} align="right">Available Amount</Typography>
                                            </Grid>
                                            <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                <Typography variant="body1" sx={{ color: 'white' }} align="left">Balance : {myBalance} CDR</Typography>
                                            </Grid>
                                            <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1} >
                                                <Grid container alignItems='flex-end' display="flex" justifyContent={"end"}>
                                                    <Grid item >
                                                        <Typography variant="body1" sx={{ color: 'white', display: 'inline', marginLeft: 2 }} align="left">(${Number(pendingReward * CDRprice).toFixed(4) })</Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <Typography variant="body1" sx={{ color: 'white', fontSize: 24, display: 'inline', marginLeft: 2 }} align="left">{Number(pendingReward).toFixed(4) }</Typography>                                                       
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Button variant="contained" size="large" fullWidth
                                                    onClick={() => { onClickClaim() }}
                                                >Claim Reward</Button>
                                            </Grid>
                                            <Grid item  xs={12} sm={6}>
                                                <Button variant="contained" size="large" fullWidth
                                                    onClick={() => { onClickUnstake() }}
                                                >Unvest CDR</Button>
                                            </Grid>
                                        </Grid>
                                        {/* <Grid container alignItems='center' my={2} py={2} justifyContent='space-between' style={{ border: '2px solid white', borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="left">Daily:</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="right">{Number(dsUtilNumberWithCommas(dailyReward)).toFixed(4)} CDR (${Number(dailyReward * CDRprice).toFixed(4)})</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="left">Monthly:</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="right">{Number(dsUtilNumberWithCommas(dailyReward)*31).toFixed(4)} CDR (${Number(dailyReward*31 * CDRprice).toFixed(4)})</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="left">Yearly:</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                    <Typography variant="body1" sx={{ color: 'white' }} lineHeight={2} align="right">{Number(dsUtilNumberWithCommas(dailyReward)*365).toFixed(4)} CDR (${Number(dailyReward*365 * CDRprice).toFixed(4)})</Typography>
                                                </Grid>
                                        </Grid> */}
                                    </>)}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </div >
    )
};

export default Vesting;
