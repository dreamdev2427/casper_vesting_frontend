import { useEffect, useState } from "react";
import { Divider, Grid, Typography, Box, Button,  TextField } from "@mui/material";

import {useSelector} from "react-redux";
import BigNumber from "big-number";

import {vestingContractAddress, vestingContractPackageHash, vestingTokenAddress, vestingTokenSymbol } from "../config";
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
        calc_claimable_amount
      } = useCasperWeb3Provider();

    const activeAddress = useSelector(state => state.auth.currentWallet);

    const [switchPanal, setSwitchPanal] = useState(true);
    const [totalVolumnInVesting, setTotalVolumnVested] = useState(0);
    const [myVested, setMyVested] = useState(0);
    const [myBalance, setMyBalance] = useState(0);
    const [VestingAmount, setVestingAmount] = useState(0);
    const [VestingDuration, setVestingDuration] = useState(1);
    const [receipentAddress, setReceipentAddress] = useState("0202cccb84498ead918e208e8424ec2b13c493c2d76f7d246b51596d12cf5c84e58f");
    const [hourlyVesting, sethourlyVesting] = useState(0);
    const [claimableAmount, setClaimableAmount] = useState(0);

    useEffect(() => {        
      if(!!activeAddress && activeAddress !== "") {
        initializeInformation();
      }
    }, [activeAddress])

    useEffect(() => {
        const interval = setInterval(() => {
            if(!!activeAddress && activeAddress !== "") {
                calcAndReadClaimiInfor();
            }
        }, 6000000);
        return () => clearInterval(interval);
    }, []);

    const calcAndReadClaimiInfor = async () => {         
        await calc_claimable_amount(activeAddress);
        await fetchClaimableAmount();
    }

    const initializeInformation = async () => {        
        await getTotalVoumnOfVesting();
        await getMyTokenBalance();        
        await getMyVestedAmount();
        await getMyHourlyVesting();
        await calcAndReadClaimiInfor();
    }

    const getTotalVoumnOfVesting = async () => {
        try
        {
            let tva = await totalVestingAmount(vestingContractAddress);
            console.log("tva = ", tva && Number(tva)/1000000);
            if(tva) setTotalVolumnVested(Number(tva)/1000000);
        }
        catch(error){
            console.log(error);
        }
    }

    const getMyTokenBalance = async () => {
        const balance = await balanceOf(vestingTokenAddress, activeAddress);
        console.log("balance = ", Number(balance)/1000000);
        setMyBalance(Number(balance)/1000000);
    }

    const getMyVestedAmount = async () => {        
        const va = await getVestedAmount(activeAddress);
        if(va) 
        {
            let temp = Number(va._hex)/1000000;
            console.log(temp);
            setMyVested(temp);        
        }
    }

    const getMyHourlyVesting = async () => { 
        const hv = await getHourlyVesting(activeAddress);
        if(hv) 
        {
            let temp = Number(hv._hex);
            console.log(temp);
            sethourlyVesting(temp);        
        }
    }

    const fetchClaimableAmount = async () => {
        const lockamount = await getClaimableAmount(activeAddress);
        if(lockamount) 
        {
            let aa = Number(lockamount._hex)/1000000;
            console.log(aa);
            setClaimableAmount(aa);        
        }
    }

    const onClickMax = async () => {     
        setVestingAmount(myBalance);   
    }    
      
    const handleVest = async () => {       
        if(!!activeAddress && activeAddress !== "") { 
            try
            {
                let currentAllowance =  await allowanceOf(vestingTokenAddress, vestingContractPackageHash, activeAddress);
                currentAllowance =  BigNumber(Math.floor(Number(currentAllowance)));
                console.log("currentAllowance = ", currentAllowance.toString());
                var decimals =  BigNumber("10").power(6);
                let vestingAmount = BigNumber((VestingAmount).toString()).multiply(decimals);
                var max_allowance =  BigNumber("9999999999999").multiply(decimals);
                if(currentAllowance - BigNumber(VestingAmount) < 0)
                {   
                    await approve(max_allowance.toString(), vestingTokenAddress, vestingContractPackageHash, activeAddress);
                }
                await vest(vestingAmount, BigNumber(VestingDuration*1000), receipentAddress, activeAddress);
                await initializeInformation();
            }
            catch(error){
                console.log("handleVest exception : ", error);
            }
        }
    }

    const handleClaim = async () => {       
        if(!!activeAddress && activeAddress !== "") { 
            try
            {
                await claim(activeAddress);
                await initializeInformation();
            }
            catch(error){
                console.log("claim error : ", error);
            }
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
                                <Typography sx={{ color: 'white' }} variant="body1">Hourly Vesting</Typography>
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
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Vesting Amount</Typography>
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
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Vesting Duration</Typography>
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
                                                        <Typography color='#fff'>Second</Typography>                                                     
                                                    </Grid>
                                                </Grid>
                                            </Grid>                                            
                                            <Grid container alignItems='center' justifyContent='space-between' style={{ border: '2px solid white', marginTop:"10px", borderRadius: 12 }}>
                                                <Grid item sm={6} md={6} lg={6} xl={6} px={2} pt={1}>
                                                    <Typography variant="h6" sx={{ color: 'white' }} align="left">Receipent publick key</Typography>
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
        </div >
    )
};

export default Vesting;
