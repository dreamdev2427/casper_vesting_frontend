casper-client put-deploy     --node-address http://3.208.91.63:7777   \
  --chain-name casper-test   \
    --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-entry-point "approve" \
   --session-hash hash-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0 \
   --session-arg "spender:key='hash-d914408555ec1dde3907dc929f6e0c7be24b62d993d71d943d8581e6646e3a70'" \
   --session-arg "amount:U256='68000000000'" 

casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-6cdfe85c0c43dcadde55191e31fe29c4b93f253c499f4142db7422d8d418e050 \
   --session-entry-point "init" \
   --session-arg "scontract-hash:string='contract-package-wasmd914408555ec1dde3907dc929f6e0c7be24b62d993d71d943d8581e6646e3a70'" 

casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-6cdfe85c0c43dcadde55191e31fe29c4b93f253c499f4142db7422d8d418e050 \
   --session-entry-point "lock" \
   --session-arg "cliff_durtime:u64='2000000002'"\
   --session-arg "cliff_amount:U256='2000000000'"\
   --session-arg "unit_time:u64='10000'"\
   --session-arg "recipient:string='account-hash-0256f840a7b330d8164779c51e1af3959d94d1dd4b9d0bb2e4acf85f094a4bf4'" \
   --session-arg "token-hash:string='contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0'" 

   casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-6cdfe85c0c43dcadde55191e31fe29c4b93f253c499f4142db7422d8d418e050 \
   --session-entry-point "claimable_amont"\
   --session-arg "recipient:string='account-hash-0256f840a7b330d8164779c51e1af3959d94d1dd4b9d0bb2e4acf85f094a4bf4'" \
   --session-arg "token-hash:string='contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0'" \
   --session-arg "uparse:u64='9'"

   casper-client put-deploy     --node-address http://3.208.91.63:7777   \
   --chain-name casper-test   \
   --secret-key ed25519-keys/secret_key.pem  \
   --payment-amount 60000000000   \
   --session-hash hash-6cdfe85c0c43dcadde55191e31fe29c4b93f253c499f4142db7422d8d418e050 \
   --session-entry-point "claim"\
   --session-arg "recipient:string='account-hash-0256f840a7b330d8164779c51e1af3959d94d1dd4b9d0bb2e4acf85f094a4bf4'" \
   --session-arg "token-hash:string='contract-de93171e1867e787f771a8ad04dd33b1167fbf9cdde1468443dcb640fccca1a0'" \
   --session-arg "uparse:u64='10'"

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

1: lock_timestamp
2: lock_amount
3: vested_amount
4: release_time_unit
5: release_amount_per_unitime
6: release_total_time
7: claimable_amont