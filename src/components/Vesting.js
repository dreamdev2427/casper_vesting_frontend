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
        getHourlyVesting,
        calc_claimable_amount,
        getSymbol,
        getDecimal
      } = useCasperWeb3Provider();

    
    const activeAddress = useSelector(state => state.auth.currentWallet);
    const [working, setWorking] = useState(false);
    const [switchPanal, setSwitchPanal] = useState(true);
    const [totalVolumnInVesting, setTotalVolumnVested] = useState(0);
    const [myVested, setMyVested] = useState(0);
    const [myBalance, setMyBalance] = useState(0);
    const [VestingTokenHash, setVestingTokenHash] = useState(vestingTokenAddress);
    const [VestingAmount, setVestingAmount] = useState(0);
    const [VestingDuration, setVestingDuration] = useState(1);
    const [receipentAddress, setReceipentAddress] = useState("0202cccb84498ead918e208e8424ec2b13c493c2d76f7d246b51596d12cf5c84e58f");
    const [hourlyVesting, sethourlyVesting] = useState(0);
    const [claimableAmount, setClaimableAmount] = useState(0);
    const [ClaimPeriod, setClaimPeriod] = useState(1);
    const [vestingTokenSymbol, setVestingTokenSymbol] = useState("ACME"); 
    const [vestingTokenDecimal, setVestingTokenDecimal] = useState(6); 
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
      if(!!activeAddress && activeAddress !== "" && activeAddress !== prevActiveAddress) {
        initializeInformation();
      }
    }, [activeAddress])

    useEffect(() => {
        if(!!VestingTokenHash && VestingTokenHash !== "" && VestingTokenHash !== prevVestingTokenHash) {      
            setWorking(true); 
            try{    
             getTokenSymbol();
             getMyTokenBalance();      
             getTokenDecimal();        
            }catch(e){ setWorking(false); }
             setWorking(false);     
        }
    }, [VestingTokenHash])

    useEffect(() => {
        const interval = setInterval(() => {
            if(!!activeAddress && activeAddress !== "") {
                calcAndReadClaimiInfor();
            }
        }, 18000000);
        return () => clearInterval(interval);
    }, []);

    const calcAndReadClaimiInfor = async () => {    
        setWorking(true);
        try{     
        await calc_claimable_amount(activeAddress, VestingTokenHash);
        await fetchClaimableAmount();
        }catch(e){setWorking(false)}
        setWorking(false);
    }

    const initializeInformation = async () => {           
        setWorking(true);     
        try{
        await getTotalVoumnOfVesting();
        await getTokenSymbol();
        await getTokenDecimal();
        await getMyTokenBalance();        
        await getMyVestedAmount();
        await getMyHourlyVesting();
        await calcAndReadClaimiInfor();
        }catch(e){setWorking(false);}
        setWorking(false);
    }

    const getTotalVoumnOfVesting = async () => {
        try
        {
            let tva = await totalVestingAmount(vestingContractAddress);
            console.log("tva = ", tva && Number(tva)/(10**vestingTokenDecimal));
            if(tva) setTotalVolumnVested(Number(tva)/(10**vestingTokenDecimal));
        }
        catch(error){
            console.log(error);
        }
    }

    const getTokenDecimal = async () => {
        try
        {
            let decimal = await getDecimal(VestingTokenHash, activeAddress);
            console.log("decimal = ", decimal._hex);
            if(decimal) setVestingTokenDecimal(Number(decimal._hex));
        }
        catch(error){
            console.log(error);
        }
    }

    const getTokenSymbol = async () => {
        try
        {
            let symbol = await getSymbol(VestingTokenHash, activeAddress);
            console.log("symbol = ", symbol);
            if(symbol) setVestingTokenSymbol(symbol);
        }
        catch(error){
            console.log(error);
        }
    }

    const getMyTokenBalance = async () => {        
        if(!!VestingTokenHash && VestingTokenHash !== "") {
            try{
            const balance = await balanceOf(VestingTokenHash, activeAddress);
            console.log("balance = ", Number(balance)/(10**vestingTokenDecimal));
            setMyBalance(Number(balance)/(10**vestingTokenDecimal));
            }catch(error){}
        }
    }

    const getMyVestedAmount = async () => {        
        if(!!activeAddress && activeAddress !== "" && !!VestingTokenHash && VestingTokenHash !== "") {
            try{
            const va = await getVestedAmount(activeAddress, VestingTokenHash);
            if(va) 
            {
                let temp = Number(va._hex)/(10**vestingTokenDecimal);
                console.log(temp);
                setMyVested(temp);        
            }
        }catch(error){}
        }
    }

    const getMyHourlyVesting = async () => { 
        if(!!activeAddress && activeAddress !== "" && !!VestingTokenHash && VestingTokenHash !== "") {
            try{
            const hv = await getHourlyVesting(activeAddress, VestingTokenHash);
            if(hv) 
            {
                let temp = Number(hv._hex)/(10**vestingTokenDecimal);
                console.log(temp);
                sethourlyVesting(temp);        
            }
        }catch(error){}
        }
    }

    const fetchClaimableAmount = async () => {
        if(!!activeAddress && activeAddress !== "" && !!VestingTokenHash && VestingTokenHash !== "") {
            try{
            const lockamount = await getClaimableAmount(activeAddress, VestingTokenHash);
            if(lockamount) 
            {
                let aa = Number(lockamount._hex)/(10**vestingTokenDecimal);
                console.log("claimable_amount = ", aa);
                setClaimableAmount(aa);        
            }
        }catch(error){}
        }
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

    const handleClaim = async () => {       
        if(!!activeAddress && activeAddress !== "") {             
            setWorking(true);
            try
            {
                await claim(activeAddress, receipentAddress, VestingTokenHash);
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
                        <Grid item sm={3} md={3} lg={3} xl={3}>
                            <Typography sx={{ color: 'white' }} variant="body1">Total Volume in vesting</Typography>
                            <Typography sx={{ color: 'white' }} variant="h6" fontWeight='bold'>{totalVolumnInVesting} {vestingTokenSymbol}</Typography>
                        </Grid>
                        {
                            !switchPanal && 
                            <>
                            <Grid item sm={3} md={3} lg={3} xl={3}>
                                <Typography sx={{ color: 'white' }} variant="body1">Hourly Rate</Typography>
                                <Typography sx={{ color: '#fa9422' }} variant="h6" fontWeight='bold'>{hourlyVesting} {vestingTokenSymbol} </Typography>
                            </Grid>
                            <Grid item sm={3} md={3} lg={3} xl={3}>
                                <Typography sx={{ color: 'white' }} variant="body1">My Vested</Typography>
                                <Typography sx={{ color: 'white' }} variant="h6" fontWeight='bold'>{myVested} {vestingTokenSymbol}</Typography>
                            </Grid>                        
                            </>
                        }
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
                                        <Grid container alignItems='center' mb={2} py={2} justifyContent='space-between' style={{ border: '2px solid white', borderRadius: 12 }}>
                                            <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                <Typography variant="h6" sx={{ color: 'white' }} lineHeight={2} align="left">{vestingTokenSymbol}</Typography>
                                            </Grid>
                                            <Grid item sm={4} md={4} lg={4} xl={4} px={4}>
                                                <Typography variant="h6" sx={{ color: 'white' }} align="right">Available Amount</Typography>
                                            </Grid>
                                            <Grid item sm={6} md={6} lg={6} xl={6} px={2}>
                                                <Typography variant="body1" sx={{ color: 'white' }} align="left">Balance : {myBalance} {vestingTokenSymbol}</Typography>
                                            </Grid>
                                            <Grid item sm={6} md={6} lg={6} xl={6} px={2} py={1} >
                                                <Grid container alignItems='flex-end' display="flex" justifyContent={"end"}>
                                                    <Grid item>
                                                        <Typography variant="body1" sx={{ color: 'white', fontSize: 24, display: 'inline', marginLeft: 2 }} align="left">{Number(claimableAmount).toFixed(4) }</Typography>                                                       
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={12}>
                                                <Button variant="contained" size="large" fullWidth
                                                    onClick={() => { handleClaim() }}
                                                >Claim {vestingTokenSymbol}</Button>
                                            </Grid>
                                        </Grid>
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
