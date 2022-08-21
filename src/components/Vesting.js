import { useEffect, useState, useRef } from "react";
import { Divider, Grid, Typography, Box, Button,  TextField, Backdrop, CircularProgress } from "@mui/material";

import {useSelector} from "react-redux";
import BigNumber from "big-number";

import {vestingContractAddress, vestingContractPackageHash, vestingTokenAddress } from "../config";
import useCasperWeb3Provider from "../web3";

const Vesting = () => {

    const {
        balanceOf,
        allowanceOf,
        approve,
        totalVestingAmount,
        vest,
        claim,
        getClaimableAmount,
        getVestedAmount,
        getLockedAmount,
        getHourlyVesting,
        getSymbol,
        getDecimal,
        getClaimPeriod,
        getUserInfoCount,
        getLockTimestamp,
        getDuration
      } = useCasperWeb3Provider();

    
    const activeAddress = useSelector(state => state.auth.currentWallet);
    const [working, setWorking] = useState(false);
    const [switchPanal, setSwitchPanal] = useState(true);
    const [totalVolumnInVesting, setTotalVolumnVested] = useState(0);
    const [myLocked, setMyLocked] = useState(0);
    const [myVested, setMyVested] = useState(0);
    const [myBalance, setMyBalance] = useState(0);
    const [VestingTokenHash, setVestingTokenHash] = useState(vestingTokenAddress);
    const [VestingAmount, setVestingAmount] = useState(0);
    const [VestingDuration, setVestingDuration] = useState(1);
    const [receipentAddress, setReceipentAddress] = useState("0202cccb84498ead918e208e8424ec2b13c493c2d76f7d246b51596d12cf5c84e58f");
    const [ClaimPeriod, setClaimPeriod] = useState(1);
    const [vestingTokenSymbol, setVestingTokenSymbol] = useState("ACME"); 
    const [vestingTokenDecimal, setVestingTokenDecimal] = useState(6); 
    const [userInfo, setUserInfo] = useState([]);
    const prevVestingTokenHash = usePrevious(VestingTokenHash);
    const prevActiveAddress = usePrevious(activeAddress);

    function usePrevious(value) {
        // The ref object is a generic container whose current property is mutable ...
        // ... and can hold any value, similar to an instance property on a class
        const ref = useRef();
        // Store current value in ref
        useEffect(() => {
          ref.current = value;
        }, [value]); // Only re-run if value changes
        // Return previous value (happens before update in useEffect above)
        return ref.current;
      }

    useEffect(() => {        
      if(!!activeAddress && activeAddress !== "" && activeAddress !== prevActiveAddress || 
      !!VestingTokenHash && VestingTokenHash !== "" && VestingTokenHash !== prevVestingTokenHash) {
        initializeInformation();
      }
    }, [activeAddress, VestingTokenHash])

    useEffect(() => {
        let interval = 0;
        setTimeout(() => {
            interval = setInterval(() => {
                if(!!activeAddress && activeAddress !== "" && !!VestingTokenHash && VestingTokenHash) {
                    initializeInformation();
                }
            }, 600000);
        }, 600000);
        return () => clearInterval(interval);
    }, []);

    const calculateClaimableAmount = (locktimestamp, releasetimeunit, releaseamountperhour, lockedamount, vestedamount) =>{
        let calsResult = 0;
        if(locktimestamp>=0 && releasetimeunit>=0 && releaseamountperhour>=0 && lockedamount>=0 && vestedamount>=0)
        {
            let past_hours = (Date.now() * 1000 - locktimestamp)/releasetimeunit;
            let vestable_till_now = releaseamountperhour * past_hours;
            if(vestable_till_now > lockedamount) vestable_till_now = lockedamount;
            calsResult = vestable_till_now - vestedamount*(10**vestingTokenDecimal);
        }
        return calsResult;
    }

    const initializeInformation = async () => {           
        setWorking(true);     
        let promiseArray = [], infoCount = 0;
        promiseArray.push(totalVestingAmount(vestingContractAddress));
        promiseArray.push(getSymbol(VestingTokenHash, activeAddress));
        promiseArray.push(getDecimal(VestingTokenHash, activeAddress));
        promiseArray.push(balanceOf(VestingTokenHash, activeAddress));        
        promiseArray.push(getVestedAmount(activeAddress, VestingTokenHash));  
        promiseArray.push(getUserInfoCount(activeAddress, VestingTokenHash));
        await Promise.all(promiseArray)
        .then((values) => {
            if(values[0]) 
            {
                console.log("tva = ", values[0] && Number(values[0])/(10**vestingTokenDecimal));
                setTotalVolumnVested(Number(values[0])/(10**vestingTokenDecimal));                
            }
            if(values[1]) 
            {
                console.log("symbol = ", values[1]);
                setVestingTokenSymbol(values[1]);
            }
            if(values[2]) 
            {
                console.log("decimal = ", values[2]._hex);
                setVestingTokenDecimal(Number(values[2]._hex));
            }
            if(values[3]) 
            {
                console.log("balance = ", Number(values[3])/(10**vestingTokenDecimal));
                setMyBalance(Number(values[3])/(10**vestingTokenDecimal));
            }
            let temp = 0;
            if(values[4]) 
            {
                temp = Number(values[4]._hex)/(10**vestingTokenDecimal);
                console.log("vestedamount = ", temp);
                setMyVested(temp);        
            }
            if(values[5]) 
            {
                temp = Number(values[5]._hex);
                infoCount = temp;    
            }
        })
        .catch((error) => {
            setWorking(false);
            return;
        });
        console.log("infocount = ", infoCount);
        if(infoCount > 0)
        {   
            let tempUserInfo = [];
            promiseArray = [];
            for(let idx=0; idx<infoCount; idx++)
            {                
                promiseArray.push(getLockTimestamp(activeAddress, VestingTokenHash, idx));
                promiseArray.push(getLockedAmount(activeAddress, VestingTokenHash, idx));
                promiseArray.push(getHourlyVesting(activeAddress, VestingTokenHash, idx));
                promiseArray.push(getClaimPeriod(activeAddress, VestingTokenHash, idx));
                promiseArray.push(getDuration(activeAddress, VestingTokenHash, idx));
                promiseArray.push(getVestedAmount(activeAddress, VestingTokenHash, idx));
            }
            await Promise.all(promiseArray)
            .then((values) => {
                for(let idx=0; idx<infoCount; idx++)
                {
                    tempUserInfo[idx] = {
                        locktimestamp: values[idx*4] ? Number(values[idx*4]._hex) : 0,
                        lockedamount: values[idx*4+1] ? Number(values[idx*4+1]._hex)/(10**vestingTokenDecimal) : 0,
                        hourlyvesting: values[idx*4+2] ? Number(values[idx*4+2]._hex)/(10**vestingTokenDecimal) : 0,
                        claimperiod: values[idx*4+3] ? Number(values[idx*4+3]._hex) : 0,           
                        duration: values[idx*4+4] ? Number(values[idx*4+4]._hex) : 0,  
                        vestedamount: values[idx*4+5] ? Number(values[idx*4+5]._hex)/(10**vestingTokenDecimal) : 0,
                        claimableamount:                  
                            calculateClaimableAmount(Number(values[idx*4]._hex), Number(values[idx*4+3]._hex), Number(values[idx*4+2]._hex)/(10**vestingTokenDecimal), Number(values[idx*4+1]._hex), Number(values[idx*4+5]._hex)/(10**vestingTokenDecimal))/(10**vestingTokenDecimal)
                    }              
                }
                console.log(tempUserInfo);  
                setUserInfo(tempUserInfo);
            })
            .catch((error) => {
                setWorking(false);
                return;
            });
        }
        setWorking(false);
    }

    const onClickMax = async () => {     
        setVestingAmount(myBalance);   
    }    
      
    const handleVest = async () => {       
        if(!!activeAddress && activeAddress !== "" && !!VestingTokenHash && VestingTokenHash !== "") { 
            setWorking(true);
            let currentAllowance,vestingAmount;
            try
            {
                currentAllowance =  await allowanceOf(VestingTokenHash, vestingContractPackageHash, activeAddress);
                currentAllowance =  BigNumber(Math.floor(Number(currentAllowance)));
                console.log("currentAllowance = ", currentAllowance.toString());
                var decimals =  BigNumber("10").power(vestingTokenDecimal);
                vestingAmount = BigNumber((VestingAmount).toString()).multiply(decimals);
                var max_allowance =  BigNumber("9999999999999").multiply(decimals);
                if(currentAllowance - BigNumber(VestingAmount) < 0)
                {   
                    await approve(max_allowance.toString(), VestingTokenHash, vestingContractPackageHash, activeAddress);
                }               
            }
            catch(error){
                setWorking(false);
                console.log("handleVest exception : ", error);
                return;
            }
            try{                
                await vest(VestingTokenHash, vestingAmount, BigNumber(VestingDuration), BigNumber(ClaimPeriod), receipentAddress, activeAddress);
            }catch(error){
                setWorking(false);
                return;
            }
            try{                
                setVestingAmount(0);
                setVestingDuration(1);
                setClaimPeriod(1);
                await initializeInformation();
            }catch(error){
                setWorking(false);
                return;
            }
            setWorking(false);
        }
    }

    const handleClaim = async (index) => {       
        if(!!activeAddress && activeAddress !== "") {             
            setWorking(true);
            try
            {
                await claim(activeAddress, receipentAddress, VestingTokenHash, index);
            }
            catch(error){
                setWorking(false);
                console.log("claim error : ", error);
                return;
            }
            try
            {
                await initializeInformation();
            }
            catch(error){
                setWorking(false);
                console.log("claim error : ", error);
            }
            setWorking(false);
        }
    }

    return (
        <div style={{ width: '100%', display: 'flex', height:"95vh", flexDirection: 'column' }}>
            <Grid container justifyContent='center' style={{flex:1}} p={4}>
                <Grid item sm={12} md={10} lg={10} xl={10} style={{ border: '2px solid white',flex:1 }}>
                    <Grid container pt={2} alignItems='center' justifyContent='space-around'>
                        <Grid item sm={4} md={4} lg={4} xl={4} sx={{display:"flex", alignItems:"center", flexDirection:"column"}}>
                            <Typography sx={{ color: 'white' }} variant="body1">Total Volume in vesting</Typography>
                            <Typography sx={{ color: 'white' }} variant="h6" fontWeight='bold'>{totalVolumnInVesting} {vestingTokenSymbol}</Typography>
                        </Grid>
                        <Grid item sm={4} md={4} lg={4} xl={4} sx={{display:"flex", alignItems:"center", flexDirection:"column"}}>
                            <Typography sx={{ color: 'white' }} variant="body1">My Balance</Typography>
                            <Typography sx={{ color: 'white' }} variant="h6" fontWeight='bold'>{Number(myBalance)} {vestingTokenSymbol}</Typography>
                        </Grid>
                        <Grid item sm={12} md={12} lg={12} xl={12} mt={2}>
                            <Divider color="white" />
                        </Grid>
                        
                        <Grid container alignItems='center' justifyContent='space-between' style={{ padding: 2, marginTop:"10px", border: '2px solid white', borderRadius: 12 }}>
                            <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                <Typography variant="h6" sx={{ color: 'white' }} align="left">Token Hash</Typography>
                            </Grid>
                            <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                <Typography variant="h6" sx={{ color: 'white' }} align="right"></Typography>
                            </Grid>
                            <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                <Grid container alignItems='flex-end' >
                                    <Grid item >
                                        <TextField size="medium" type='text' variant="standard" defaultValue={""} 
                                            sx={{ backgroundColor: 'transparent', input: { color: 'white', borderColor: 'white', fontSize: 16 }, width: 800 }} 
                                            value={ VestingTokenHash }
                                            onChange={(e) => setVestingTokenHash(e.target.value)}
                                            placeholder="b02ec9fe439a945bcc0cc4a786f22fab7ae41829e10ea029e6f82af1b3833b60" 
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                <Grid container alignItems='center' justifyContent='right'>
                                    <Grid item sm={6} md={3} lg={3} xl={3}>                                                            
                                    </Grid>                                                       
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sm={12} md={12} lg={12} xl={12} p={2}>
                            <Grid container>
                                <Box sx={{ width: '100%', typography: 'body1', padding: 2 }}>
                                    <Grid container alignItems='center' mb={2} py={2} justifyContent='space-around'>
                                        <Grid item xs={12} sm={5} md={5} lg={5} xl={5} px={2}>
                                            <Box py={1} px={2} sx={{ backgroundColor: '#fff', borderRadius: 60 }}>
                                                <Grid container alignItems='center' justifyContent='space-between'>
                                                    <Grid item xs={6} textAlign = "center" sx={{cursor:"pointer"}}>
                                                        <Typography width="100%" display='inline-block' px={0} py={1} sx={!switchPanal ? { color: '#000' } : { backgroundColor: '#055def', color: '#fff', borderRadius: 50 }} onClick={() => setSwitchPanal(true)}>Vestor</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} textAlign = "center" sx={{cursor:"pointer"}}>
                                                        <Typography width="100%" display='inline-block' px={0} py={1} sx={switchPanal ? { color: '#000' } : { backgroundColor: '#055def', color: '#fff', borderRadius: 50 }} onClick={() => setSwitchPanal(false)}>Receipent</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    
                                    {switchPanal ? (
                                        <>
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', marginTop:"10px", borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Amount</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="right">Wallet balance: {myBalance} {vestingTokenSymbol}</Typography>
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
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', marginTop:"10px", borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Duration</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="right"></Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='flex-end' >
                                                        <Grid item >
                                                            <TextField size="medium" type='number' variant="standard" defaultValue={"365.45"} 
                                                                sx={{ backgroundColor: 'transparent', input: { color: 'white', borderColor: 'white', fontSize: 24 }, width: 200 }} 
                                                                value={VestingDuration}
                                                                onChange={(e) => setVestingDuration(e.target.value)}
                                                                placeholder="0.00" 
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='center' justifyContent='right'>
                                                        <Typography color='#fff'>ms</Typography>                                                     
                                                    </Grid>
                                                </Grid>
                                            </Grid>            
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', marginTop:"10px", borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Claim Period</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="right"></Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='flex-end' >
                                                        <Grid item >
                                                            <TextField size="medium" type='number' variant="standard" defaultValue={"365.45"} 
                                                                sx={{ backgroundColor: 'transparent', input: { color: 'white', borderColor: 'white', fontSize: 24 }, width: 200 }} 
                                                                value={ClaimPeriod}
                                                                onChange={(e) => setClaimPeriod(e.target.value)}
                                                                placeholder="0.00" 
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='center' justifyContent='right'>
                                                        <Typography color='#fff'>ms</Typography>                                                     
                                                    </Grid>
                                                </Grid>
                                            </Grid>                                          
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', marginTop:"10px", borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Receipent public key</Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="right"></Typography>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='flex-end' >
                                                        <Grid item >
                                                            <TextField  type='text' variant="standard" defaultValue={""} 
                                                                sx={{ backgroundColor: 'transparent', input: { color: 'white', borderColor: 'white', fontSize: 16 }, width: 800 }} 
                                                                value={receipentAddress}
                                                                onChange={(e) => setReceipentAddress(e.target.value)}
                                                                placeholder="0202cccb84498ead918e208e8424ec2b13c493c2d76f7d246b51596d12cf5c84e58f" 
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1}>
                                                    <Grid container alignItems='center' justifyContent='right'>
                                                                                                            
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Button variant="contained" size="large" style={{marginTop:"10px"}} fullWidth
                                             onClick={() => {handleVest()}}
                                            >Vest {vestingTokenSymbol}</Button>
                                        </>
                                    ) : (<>
                                        {
                                            userInfo.map((item, index) => (
                                                <Grid container key={index} alignItems='center' mb={2} py={2} justifyContent='space-between' 
                                                    style={{ border: '2px solid white', borderRadius: 12, cursor:"pointer", userSelect:"none" }}
                                                    onClick={()=> handleClaim(index)}
                                                >
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                        <Typography variant="h6" sx={{ color: 'white' }} lineHeight={2} align="left">{vestingTokenSymbol}</Typography>
                                                    </Grid>
                                                    <Grid item sm={4} md={4} lg={4} xl={4} px={4}>
                                                        <Typography variant="h6" sx={{ color: 'white' }} align="right">Available to Claim</Typography>
                                                    </Grid>
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                        <Typography variant="body1" sx={{ color: 'white' }} align="left">Claim Period : {item.claimperiod} ms</Typography>
                                                    </Grid>
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1} >
                                                    </Grid>
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                        <Typography variant="body1" sx={{ color: 'white' }} align="left">Duration : {item.duration} ms</Typography>
                                                    </Grid>
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1} >
                                                        <Typography variant="h6" sx={{ color: 'white' }} align="right"> {item.claimableamount} </Typography>
                                                    </Grid>
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                        <Typography variant="body1" sx={{ color: 'white' }} align="left">Total Locked : {item.lockedamount} {vestingTokenSymbol}</Typography>
                                                    </Grid>
                                                    <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1} >
                                                    </Grid>
                                                </Grid>
                                            ))
                                        }
                                    </>)}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            
            <Backdrop
              sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={working}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
        </div >
    )
};

export default Vesting;
