casper-client put-deploy     --node-address http://3.208.91.63:7777   \
  --chain-name casper-test   \
    --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-entry-point "approve" \
   --session-hash hash-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0 \
   --session-arg "spender:key='hash-5a5f2300568c25eaac8a8205d6052041f0ca185b43d913e49868c6ed2d2d83a0'" \
   --session-arg "amount:U256='100000000000000'" 

casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-3806ce8eb718127866bf1570fe61fcc654d990e8f235d4becbe9cb14fc098514 \
   --session-entry-point "init" \
   --session-arg "scontract-hash:string='contract-package-wasm5a5f2300568c25eaac8a8205d6052041f0ca185b43d913e49868c6ed2d2d83a0'" 

casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-3806ce8eb718127866bf1570fe61fcc654d990e8f235d4becbe9cb14fc098514 \
   --session-entry-point "lock" \
   --session-arg "cliff_utimestamp:u64='2300000'"\
   --session-arg "cliff_durtime:u64='3300000'"\
   --session-arg "cliff_amount:U256='200000000'"\
   --session-arg "unit_time:u64='15000'"\
   --session-arg "recipient:string='account-hash-0256f840a7b330d8164779c51e1af3959d94d1dd4b9d0bb2e4acf85f094a4bf4'" \
   --session-arg "token-hash:string='contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0'" 

   casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-3806ce8eb718127866bf1570fe61fcc654d990e8f235d4becbe9cb14fc098514 \
   --session-entry-point "claimable_amont"\
   --session-arg "recipient:string='account-hash-0256f840a7b330d8164779c51e1af3959d94d1dd4b9d0bb2e4acf85f094a4bf4'" \
   --session-arg "token-hash:string='contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0'" \
   --session-arg "uparse:u64='5'"

   casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-3806ce8eb718127866bf1570fe61fcc654d990e8f235d4becbe9cb14fc098514 \
   --session-entry-point "claim"\
   --session-arg "recipient:string='account-hash-0256f840a7b330d8164779c51e1af3959d94d1dd4b9d0bb2e4acf85f094a4bf4'" \
   --session-arg "token-hash:string='contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0'" \
   --session-arg "vest_id:u32='1'" \
   --session-arg  "uparse:u64='10'"

token-hash
"contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0"
"contract-6f1392e21bf27f57bc8878ba404fb7d0ef63109481253f5df86ae6f373578d6c"

casper-client put-deploy     --node-address http://3.208.91.63:7777   \
  --chain-name casper-test   \
    --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-entry-point "transfer" \
   --session-hash hash-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0 \
   --session-arg "recipient:key='account-hash-4b05191dadb56bf3b7988167e771023298f609b6596a65fe784cfecd1f262000'" \
   --session-arg "amount:U256='100000000000'" 

   0256f840a7b330dde93171e1867e78
   0256f840a7b330dde93171e1867e781
   0256f840a7b330dde93171e1867e7810

0: lock_unix_timestamp
1: lock_timestamp
2: lock_amount
3: vested_amount
4: release_time_unit
5: release_amount_per_unitime
6: release_total_time
7: claimable_amont
